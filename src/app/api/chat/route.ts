import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion, type MiniMaxMessage } from '@/lib/minimax'
import { buildSystemPrompt } from '@/data/system-prompt'
import { toolDefinitions } from '@/data/tool-definitions'
import type { Profile, ChildBenefit, Application, Reminder, EmailDraft } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProfileForUser(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  return { profile: data as Profile | null, profileId: data?.id ?? null }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { messages, mode } = body as {
    messages: { role: string; content: string }[]
    mode: string | null
  }

  const { profile, profileId } = await getProfileForUser(supabase, user.id)

  const [benefitsRes, applicationsRes, remindersRes] = await Promise.all([
    profileId ? supabase.from('child_benefits').select('*').eq('profile_id', profileId) : Promise.resolve({ data: [] }),
    profileId ? supabase.from('applications').select('*').eq('profile_id', profileId) : Promise.resolve({ data: [] }),
    profileId ? supabase.from('reminders').select('*').eq('profile_id', profileId).eq('is_complete', false).order('due_date') : Promise.resolve({ data: [] }),
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

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const miniMaxMessages: MiniMaxMessage[] = [
          { role: 'system', content: systemPrompt + modePrefix },
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ]

        let continueLoop = true
        const MAX_TOOL_ROUNDS = 5
        let round = 0

        while (continueLoop && round < MAX_TOOL_ROUNDS) {
          round++

          const response = await chatCompletion(miniMaxMessages, toolDefinitions)
          const choice = response.choices[0]
          const message = choice.message

          // Strip <think> tags from content
          let textContent = message.content || ''
          textContent = textContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

          // Check for tool calls
          if (choice.finish_reason === 'tool_calls' && message.tool_calls?.length) {
            // Add assistant message with tool calls to history
            miniMaxMessages.push({
              role: 'assistant',
              content: textContent,
              tool_calls: message.tool_calls,
            })

            for (const toolCall of message.tool_calls) {
              const fnName = toolCall.function.name
              let args: Record<string, unknown> = {}
              try {
                args = JSON.parse(toolCall.function.arguments)
              } catch { /* empty args */ }

              send({ type: 'tool_call', name: fnName })
              let result: string

              try {
                result = await executeToolCall(fnName, args, supabase, profileId, profile, benefits, applications, reminders)
              } catch (err) {
                result = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
              }

              send({ type: 'tool_result', name: fnName })

              miniMaxMessages.push({
                role: 'tool',
                content: result,
                tool_call_id: toolCall.id,
                name: fnName,
              })
            }
          } else {
            // No tool calls — send text response
            if (textContent) {
              // Check for email draft JSON
              const emailDraftMatch = textContent.match(/\{"emailDraft":\s*\{[^}]+\}\}/)
              if (emailDraftMatch) {
                try {
                  const parsed = JSON.parse(emailDraftMatch[0])
                  send({ type: 'email_draft', draft: parsed.emailDraft as EmailDraft })
                } catch { /* not valid JSON */ }
                const cleanText = textContent.replace(emailDraftMatch[0], '').trim()
                if (cleanText) send({ type: 'text', content: cleanText })
              } else {
                send({ type: 'text', content: textContent })
              }
            }
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

async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  profileId: string | null,
  profile: Profile | null,
  benefits: ChildBenefit[],
  applications: Application[],
  reminders: Reminder[]
): Promise<string> {
  if (name === 'get_user_profile') {
    const docs = profileId
      ? (await supabase.from('saved_documents').select('*').eq('profile_id', profileId).order('id', { ascending: false }).limit(10)).data || []
      : []
    return JSON.stringify({ profile, benefits, applications, reminders, documents: docs })
  }

  if (name === 'search_content') {
    const query = (args.query as string) || ''
    const { data: blocks } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,body.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(5)
    return JSON.stringify(blocks || [])
  }

  if (name === 'research') {
    const query = (args.query as string) || ''
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      const res = await fetch(`${baseUrl}/api/agents/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.AGENT_API_KEY || '' },
        body: JSON.stringify({ query }),
      })
      return await res.text()
    } catch {
      return JSON.stringify({ error: 'Research agent unavailable', query })
    }
  }

  if (name === 'save_to_profile') {
    if (!profileId) return 'Error: No profile found for this user.'

    const action = args.action as string
    const data = (args.data as Record<string, unknown>) || {}

    switch (action) {
      case 'save_email_draft': {
        await supabase.from('saved_documents').insert({
          profile_id: profileId,
          doc_type: 'email_draft',
          title: (data.subject as string) || 'Email Draft',
          recipient_name: data.recipient_name || null,
          recipient_email: (data.to as string) || (data.recipient_email as string) || null,
          recipient_role: data.recipient_role || null,
          subject: (data.subject as string) || null,
          content: (data.body as string) || JSON.stringify(data),
        })
        return 'Email draft saved successfully.'
      }
      case 'update_application': {
        const appData: Record<string, unknown> = {
          profile_id: profileId,
          program_name: data.program_name,
          status: data.status || 'in_progress',
        }
        for (const key of ['planning_list_date', 'application_date', 'denial_reason', 'appeal_deadline', 'case_number', 'coordinator_name', 'coordinator_email', 'coordinator_phone', 'notes']) {
          if (data[key]) appData[key] = data[key]
        }
        await supabase.from('applications').upsert(appData, { onConflict: 'profile_id,program_name' })
        return 'Application updated.'
      }
      case 'add_reminder': {
        await supabase.from('reminders').insert({
          profile_id: profileId,
          title: data.title,
          description: data.description || null,
          due_date: data.due_date,
          category: data.category || null,
          notify_30_days: data.notify_30_days ?? true,
          notify_7_days: data.notify_7_days ?? true,
          notify_1_day: data.notify_1_day ?? true,
        })
        return 'Reminder added.'
      }
      case 'update_benefit': {
        await supabase.from('child_benefits').upsert({
          profile_id: profileId,
          benefit_name: data.benefit_name || data.program_name,
          status: data.status || 'active',
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          notes: data.notes || null,
        }, { onConflict: 'profile_id,benefit_name' })
        return 'Benefit updated.'
      }
      case 'add_document': {
        await supabase.from('saved_documents').insert({
          profile_id: profileId,
          doc_type: data.doc_type || 'other',
          title: data.title || 'Document',
          content: (data.content as string) || '',
          recipient_name: data.recipient_name || null,
          recipient_email: data.recipient_email || null,
          recipient_role: data.recipient_role || null,
          subject: data.subject || null,
        })
        return 'Document saved.'
      }
      case 'update_profile': {
        const updates: Record<string, unknown> = {}
        for (const key of ['parent_name', 'child_name', 'child_dob', 'county', 'phone']) {
          if (data[key] !== undefined) updates[key] = data[key]
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('profiles').update(updates).eq('id', profileId)
        }
        return 'Profile updated.'
      }
      default:
        return `Unknown action: ${action}`
    }
  }

  if (name === 'flag_community_submission') {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    try {
      await fetch(`${baseUrl}/api/community/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: args.program_name ? 'program' : 'resource',
          program_name: args.program_name || null,
          description: args.description,
          source_heard_from: args.source_heard_from || null,
          submitted_by: profile?.user_id || null,
          navigator_session_id: profileId,
        }),
      })
      return 'Community submission saved. The CLIFF team will research this and add it to the resource library if verified.'
    } catch {
      return 'Could not save the submission right now, but I noted it.'
    }
  }

  return `Unknown tool: ${name}`
}
