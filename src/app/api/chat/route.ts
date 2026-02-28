import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt } from '@/data/system-prompt'
import { toolDefinitions } from '@/data/tool-definitions'
import type { Profile, ChildBenefit, Application, Reminder, EmailDraft } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProfileForUser(supabase: any, userId: string): Promise<{ profile: Profile | null; profileId: string | null }> {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  return { profile: data as Profile | null, profileId: data?.id ?? null }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { messages, mode } = body as {
    messages: { role: string; content: string }[]
    mode: string | null
  }

  // Get profile by user_id, then use profile.id for related queries
  const { profile, profileId } = await getProfileForUser(supabase, user.id)

  const [benefitsRes, applicationsRes, remindersRes] = await Promise.all([
    profileId
      ? supabase.from('child_benefits').select('*').eq('profile_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('applications').select('*').eq('profile_id', profileId)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('reminders').select('*').eq('profile_id', profileId).eq('is_complete', false).order('due_date')
      : Promise.resolve({ data: [] }),
  ])

  const benefits = (benefitsRes.data || []) as ChildBenefit[]
  const applications = (applicationsRes.data || []) as Application[]
  const reminders = (remindersRes.data || []) as Reminder[]

  const systemPrompt = buildSystemPrompt(profile, benefits, applications, reminders)
  const modePrefix = mode
    ? `\n\nThe user selected "${mode}" mode. ${
        mode === 'explore'
          ? 'Focus on exploring benefits, eligibility, and resources.'
          : mode === 'apply'
            ? 'Focus on walking through specific forms and applications step by step.'
            : 'Focus on drafting emails to agencies, caseworkers, and service providers.'
      }`
    : ''

  const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        let currentMessages = anthropicMessages
        let continueLoop = true

        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            system: systemPrompt + modePrefix,
            messages: currentMessages,
            tools: toolDefinitions,
          })

          const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = []

          for (const block of response.content) {
            if (block.type === 'text') {
              const emailDraftMatch = block.text.match(
                /\{"emailDraft":\s*\{[^}]+\}\}/
              )
              if (emailDraftMatch) {
                try {
                  const parsed = JSON.parse(emailDraftMatch[0])
                  send({ type: 'email_draft', draft: parsed.emailDraft as EmailDraft })
                } catch {
                  // Not valid JSON
                }
                const cleanText = block.text.replace(emailDraftMatch[0], '').trim()
                if (cleanText) {
                  send({ type: 'text', content: cleanText })
                }
              } else {
                send({ type: 'text', content: block.text })
              }
            } else if (block.type === 'tool_use') {
              toolUseBlocks.push(block)
              send({ type: 'tool_call', name: block.name })
            }
          }

          if (response.stop_reason === 'tool_use' && toolUseBlocks.length > 0) {
            const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

            for (const toolCall of toolUseBlocks) {
              let result: string

              try {
                if (toolCall.name === 'get_user_profile') {
                  // Fetch fresh data
                  const docs = profileId
                    ? (await supabase.from('saved_documents').select('*').eq('profile_id', profileId).order('id', { ascending: false }).limit(10)).data || []
                    : []
                  result = JSON.stringify({ profile, benefits, applications, reminders, documents: docs })

                } else if (toolCall.name === 'search_content') {
                  const input = toolCall.input as { query: string }
                  const { data: blocks } = await supabase
                    .from('content_blocks')
                    .select('*')
                    .eq('is_published', true)
                    .or(`title.ilike.%${input.query}%,body.ilike.%${input.query}%,slug.ilike.%${input.query}%`)
                    .limit(5)
                  result = JSON.stringify(blocks || [])

                } else if (toolCall.name === 'research') {
                  const input = toolCall.input as { query: string }
                  // Call the research agent internally
                  try {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
                    const res = await fetch(`${baseUrl}/api/agents/research`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.AGENT_API_KEY || '' },
                      body: JSON.stringify({ query: input.query }),
                    })
                    result = await res.text()
                  } catch (err) {
                    result = JSON.stringify({ error: 'Research agent unavailable', query: input.query })
                  }

                } else if (toolCall.name === 'save_to_profile') {
                  if (!profileId) {
                    result = 'Error: No profile found for this user.'
                  } else {
                    const input = toolCall.input as { action: string; data: Record<string, unknown> }

                    switch (input.action) {
                      case 'save_email_draft': {
                        await supabase.from('saved_documents').insert({
                          profile_id: profileId,
                          doc_type: 'email_draft',
                          title: (input.data.subject as string) || 'Email Draft',
                          recipient_name: input.data.recipient_name || null,
                          recipient_email: (input.data.to as string) || (input.data.recipient_email as string) || null,
                          recipient_role: input.data.recipient_role || null,
                          subject: (input.data.subject as string) || null,
                          content: (input.data.body as string) || JSON.stringify(input.data),
                        })
                        result = 'Email draft saved successfully.'
                        break
                      }
                      case 'update_application': {
                        const appData: Record<string, unknown> = {
                          profile_id: profileId,
                          program_name: input.data.program_name,
                          status: input.data.status || 'in_progress',
                        }
                        if (input.data.planning_list_date) appData.planning_list_date = input.data.planning_list_date
                        if (input.data.application_date) appData.application_date = input.data.application_date
                        if (input.data.denial_reason) appData.denial_reason = input.data.denial_reason
                        if (input.data.appeal_deadline) appData.appeal_deadline = input.data.appeal_deadline
                        if (input.data.case_number) appData.case_number = input.data.case_number
                        if (input.data.coordinator_name) appData.coordinator_name = input.data.coordinator_name
                        if (input.data.coordinator_email) appData.coordinator_email = input.data.coordinator_email
                        if (input.data.coordinator_phone) appData.coordinator_phone = input.data.coordinator_phone
                        if (input.data.notes) appData.notes = input.data.notes

                        await supabase.from('applications').upsert(appData, { onConflict: 'profile_id,program_name' })
                        result = 'Application updated.'
                        break
                      }
                      case 'add_reminder': {
                        await supabase.from('reminders').insert({
                          profile_id: profileId,
                          title: input.data.title,
                          description: input.data.description || null,
                          due_date: input.data.due_date,
                          category: input.data.category || null,
                          notify_30_days: input.data.notify_30_days ?? true,
                          notify_7_days: input.data.notify_7_days ?? true,
                          notify_1_day: input.data.notify_1_day ?? true,
                        })
                        result = 'Reminder added.'
                        break
                      }
                      case 'update_benefit': {
                        await supabase.from('child_benefits').upsert({
                          profile_id: profileId,
                          benefit_name: input.data.benefit_name || input.data.program_name,
                          status: input.data.status || 'active',
                          start_date: input.data.start_date || null,
                          end_date: input.data.end_date || null,
                          notes: input.data.notes || null,
                        }, { onConflict: 'profile_id,benefit_name' })
                        result = 'Benefit updated.'
                        break
                      }
                      case 'add_document': {
                        await supabase.from('saved_documents').insert({
                          profile_id: profileId,
                          doc_type: input.data.doc_type || 'other',
                          title: input.data.title || 'Document',
                          content: (input.data.content as string) || '',
                          recipient_name: input.data.recipient_name || null,
                          recipient_email: input.data.recipient_email || null,
                          recipient_role: input.data.recipient_role || null,
                          subject: input.data.subject || null,
                        })
                        result = 'Document saved.'
                        break
                      }
                      case 'update_profile': {
                        const updates: Record<string, unknown> = {}
                        for (const key of ['parent_name', 'child_name', 'child_dob', 'county', 'phone']) {
                          if (input.data[key] !== undefined) updates[key] = input.data[key]
                        }
                        if (Object.keys(updates).length > 0) {
                          await supabase.from('profiles').update(updates).eq('id', profileId)
                        }
                        result = 'Profile updated.'
                        break
                      }
                      default:
                        result = `Unknown action: ${input.action}`
                    }
                  }
                } else {
                  result = `Unknown tool: ${toolCall.name}`
                }
              } catch (err) {
                result = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
              }

              send({ type: 'tool_result', name: toolCall.name })
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: result,
              })
            }

            currentMessages = [
              ...currentMessages,
              { role: 'assistant' as const, content: response.content },
              { role: 'user' as const, content: toolResults },
            ]
          } else {
            continueLoop = false
          }
        }

        send('[DONE]')
        controller.close()
      } catch (err) {
        console.error('Chat API error:', err)
        send({ type: 'text', content: 'An error occurred. Please try again.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
