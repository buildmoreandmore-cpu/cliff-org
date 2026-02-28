import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt } from '@/data/system-prompt'
import { toolDefinitions } from '@/data/tool-definitions'
import type { Profile, ChildBenefit, Application, EmailDraft } from '@/lib/types'

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

  // Fetch user data for context
  const [profileRes, benefitsRes, applicationsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('child_benefits').select('*').eq('user_id', user.id),
    supabase.from('applications').select('*').eq('user_id', user.id),
  ])

  const profile = profileRes.data as Profile | null
  const benefits = (benefitsRes.data || []) as ChildBenefit[]
  const applications = (applicationsRes.data || []) as Application[]

  const systemPrompt = buildSystemPrompt(profile, benefits, applications)
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

          // Process content blocks
          const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = []

          for (const block of response.content) {
            if (block.type === 'text') {
              // Check for email draft JSON in the text
              const emailDraftMatch = block.text.match(
                /\{"emailDraft":\s*\{[^}]+\}\}/
              )
              if (emailDraftMatch) {
                try {
                  const parsed = JSON.parse(emailDraftMatch[0])
                  send({ type: 'email_draft', draft: parsed.emailDraft as EmailDraft })
                } catch {
                  // Not valid JSON, continue
                }
                // Send text without the JSON block
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

          // If there are tool calls, execute them and continue
          if (response.stop_reason === 'tool_use' && toolUseBlocks.length > 0) {
            const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

            for (const toolCall of toolUseBlocks) {
              let result: string

              try {
                if (toolCall.name === 'get_user_profile') {
                  result = JSON.stringify({
                    profile,
                    benefits,
                    applications,
                    reminders: (
                      await supabase
                        .from('reminders')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_completed', false)
                        .order('due_date')
                    ).data || [],
                  })
                } else if (toolCall.name === 'save_to_profile') {
                  const input = toolCall.input as {
                    action: string
                    data: Record<string, unknown>
                  }

                  switch (input.action) {
                    case 'save_email_draft':
                      await supabase.from('saved_documents').insert({
                        user_id: user.id,
                        doc_type: 'email_draft',
                        title: (input.data.subject as string) || 'Email Draft',
                        content: JSON.stringify(input.data),
                      })
                      result = 'Email draft saved successfully.'
                      break
                    case 'update_application':
                      await supabase.from('applications').upsert({
                        user_id: user.id,
                        program_name: input.data.program_name,
                        status: input.data.status || 'in_progress',
                        notes: input.data.notes,
                        next_step: input.data.next_step,
                      })
                      result = 'Application updated.'
                      break
                    case 'add_reminder':
                      await supabase.from('reminders').insert({
                        user_id: user.id,
                        title: input.data.title,
                        description: input.data.description,
                        due_date: input.data.due_date,
                        program_name: input.data.program_name,
                      })
                      result = 'Reminder added.'
                      break
                    case 'update_benefit':
                      await supabase.from('child_benefits').upsert({
                        user_id: user.id,
                        program_name: input.data.program_name,
                        status: input.data.status || 'active',
                        notes: input.data.notes,
                      })
                      result = 'Benefit updated.'
                      break
                    case 'add_document':
                      await supabase.from('saved_documents').insert({
                        user_id: user.id,
                        doc_type: input.data.doc_type || 'other',
                        title: input.data.title || 'Document',
                        content: (input.data.content as string) || '',
                      })
                      result = 'Document saved.'
                      break
                    default:
                      result = `Unknown action: ${input.action}`
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

            // Continue the conversation with tool results
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
