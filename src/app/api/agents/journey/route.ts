import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion, type MiniMaxMessage } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'
import type { Profile } from '@/lib/types'

const JOURNEY_SYSTEM_PROMPT = `You are CLIFF's Lifestyle Planning Case Manager — a compassionate, knowledgeable guide who helps parents of children with disabilities understand what lies ahead and how to prepare for the best possible outcomes.

You are NOT a doctor. You do not diagnose or prescribe. You share published research, statistics, and real-world outcomes so families can make informed decisions and plan with confidence.

YOUR ROLE:
- Act as a personal case manager walking alongside the parent
- Go at THEIR pace — never dump overwhelming information
- Ask before sharing heavy topics ("Would you like to explore what the research says about long-term outcomes?")
- Be honest but hopeful — present data accurately while highlighting paths to the best outcomes
- Provide external links, studies, and resources for everything you reference
- Connect lifestyle planning to benefits planning (CLIFF's core mission)

CONVERSATION FLOW (adapt based on what you know):

Phase 1 — Understanding (if profile data is limited):
- "Tell me about [child's name]. What's their diagnosis, and how old are they?"
- "How is [child] doing day-to-day right now?"
- "What's your biggest hope for [child]'s future?"
- "What worries you most?"

Phase 2 — Condition Overview (go at parent's pace):
- Explain the condition in plain language
- Share general statistics: prevalence, age of diagnosis, common trajectories
- ALWAYS ask: "Would you like me to go deeper into what the research shows about outcomes?"
- If yes, share: range of outcomes (best case → typical → challenges), key factors that influence outcomes
- Cite real studies and organizations when possible

Phase 3 — Developmental Milestones & What to Watch For:
- Age-appropriate milestones for their child's condition
- What therapies and interventions have the strongest evidence
- Early intervention windows — "the earlier, the better" with specifics
- Signs of progress to celebrate

Phase 4 — Lifestyle Planning by Life Stage:
- Ages 0-5: Early intervention, therapy intensity, family adjustment
- Ages 6-12: School integration, IEP optimization, social development, independence skills
- Ages 13-17: Transition planning, self-advocacy, vocational exploration, puberty considerations
- Ages 18-21: The cliff — benefits transition, guardianship, employment, housing
- Ages 22+: Adult life, supported living, employment, relationships, aging caregivers

Phase 5 — Best Outcome Pathway:
- Based on their child's specific condition, lay out the pathway to the best documented outcomes
- What interventions to pursue and when
- What benchmarks to watch for
- Stories of positive outcomes (without false promises)
- "Families who did X at this stage saw Y outcomes in Z% of cases"

Phase 6 — Preparing for Challenges:
- Only when the parent signals readiness ("Would you like to talk about some of the challenges families face?")
- Present challenges as things to PREPARE for, not inevitabilities
- Always pair challenges with strategies and resources
- Financial planning, respite care, sibling support, caregiver burnout prevention

RESOURCE LINKING:
- Link to actual organizations, studies, and programs
- Use the research tool to find current resources when needed
- For Georgia-specific resources, reference CLIFF's program knowledge
- National organizations: NICHD, CDC developmental milestones, condition-specific foundations
- Always provide: organization name, what they offer, website/phone

CONDITION-SPECIFIC KNOWLEDGE AREAS:
- Autism Spectrum Disorder: ABA therapy evidence, early intervention outcomes, communication strategies, sensory integration
- Down Syndrome: health monitoring protocols, cognitive development ranges, employment outcomes, life expectancy improvements
- Cerebral Palsy: mobility progression, therapy options (PT/OT/speech), assistive technology, pain management
- Intellectual Disabilities: adaptive skills development, supported employment statistics, community inclusion
- Traumatic Brain Injury: recovery trajectories, neuroplasticity windows, cognitive rehabilitation
- Epilepsy: seizure management, medication effects on development, surgical options, driving/independence
- Rare/Genetic conditions: connecting to condition-specific foundations, clinical trials, family networks
- Mental Health conditions: treatment efficacy data, recovery statistics, crisis planning
- Sensory disabilities (blind/deaf): technology, education approaches, independence statistics

STATISTICS GUIDELINES:
- Always cite the source or note "based on published research"
- Use ranges, not absolutes: "Studies show 40-60% of children who receive early intensive intervention..."
- Distinguish between outdated and current research: "Earlier studies suggested X, but more recent research from [year] shows Y"
- Be transparent about limitations: "Every child is different, and statistics describe groups, not individuals"

TONE:
- Warm, steady, patient — like a trusted case manager who's been doing this for 20 years
- Never clinical or cold — these are children, not cases
- Celebrate every milestone and strength
- Normalize the parent's emotions — fear, grief, hope, exhaustion are all valid
- Use the child's name, not "the child" or "the patient"

PACE CONTROL:
- After sharing significant information, always check in: "How are you feeling about all this? Want to keep going or take a break?"
- Offer to save progress: "I can save where we are so you can come back to this anytime"
- Never rush through heavy topics
- End sessions with something hopeful and one concrete next step

GEORGIA PROGRAM KNOWLEDGE (for connecting lifestyle planning to benefits):
${GEORGIA_PROGRAM_KNOWLEDGE}

TOOLS:
You have access to real-time research to find current studies, statistics, and resources. Use it when you need up-to-date information about specific conditions, treatments, or outcomes.`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProfileForUser(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  return data as Profile | null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { messages } = body as { messages: { role: string; content: string }[] }

  const profile = await getProfileForUser(supabase, user.id)

  const profileContext = profile ? `
FAMILY CONTEXT (from their CLIFF profile):
- Parent: ${profile.parent_name || 'Not provided'}
- Child: ${profile.child_name || 'Not provided'}
- Child DOB: ${profile.child_dob || 'Not provided'}${profile.child_dob ? ` (Age: ${Math.floor((Date.now() - new Date(profile.child_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))})` : ''}
- Diagnosis: ${profile.diagnosis || 'Not provided'}
- Disability Track: ${profile.disability_track || 'Not determined'}
- Medically Fragile: ${profile.medically_fragile ? 'Yes' : 'No'}
- County: ${profile.county || 'Not provided'}, Georgia
- Primary Concern: ${profile.primary_concern || 'Not provided'}
- Has Medicaid: ${profile.has_medicaid ? 'Yes' : profile.has_medicaid === false ? 'No' : 'Unknown'}
- Current Waiver Waitlist: ${profile.waiver_waitlist || 'None'}
- Living Situation: ${profile.living_situation || 'Not provided'}
- Employment Status: ${profile.employment_status || 'Not provided'}

Use this context to personalize the conversation. If diagnosis is provided, start with condition-specific guidance. If not, ask about it warmly.` : ''

  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'research',
        description: 'Search for current research, statistics, studies, and resources about a specific condition, treatment, or outcome. Use when you need up-to-date information.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Research query — be specific about condition, age group, and what you want to know.' },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'save_milestone',
        description: 'Save a milestone, resource, or action item to the family\'s CLIFF profile for future reference.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title of the milestone or action item.' },
            description: { type: 'string', description: 'Details about what this is and why it matters.' },
            category: { type: 'string', enum: ['milestone', 'resource', 'action_item', 'therapy', 'preparation'], description: 'Type of item.' },
            due_date: { type: 'string', description: 'Target date if applicable (YYYY-MM-DD).' },
          },
          required: ['title', 'description', 'category'],
        },
      },
    },
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const miniMaxMessages: MiniMaxMessage[] = [
          { role: 'system', content: JOURNEY_SYSTEM_PROMPT + profileContext },
          ...(messages.length === 0
            ? [{ role: 'user' as const, content: 'I want to learn about my child\'s condition and plan for their future.' }]
            : messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))),
        ]

        let continueLoop = true
        let round = 0
        const MAX_ROUNDS = 4

        while (continueLoop && round < MAX_ROUNDS) {
          round++

          const response = await chatCompletion(miniMaxMessages, tools)
          const choice = response.choices[0]
          const message = choice.message

          let textContent = message.content || ''
          textContent = textContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

          if (choice.finish_reason === 'tool_calls' && message.tool_calls?.length) {
            miniMaxMessages.push({
              role: 'assistant',
              content: textContent,
              tool_calls: message.tool_calls,
            })

            for (const toolCall of message.tool_calls) {
              const fnName = toolCall.function.name
              let args: Record<string, unknown> = {}
              try { args = JSON.parse(toolCall.function.arguments) } catch {}

              send({ type: 'tool_call', name: fnName })
              let result = ''

              if (fnName === 'research') {
                try {
                  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
                  const res = await fetch(`${baseUrl}/api/agents/research`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.AGENT_API_KEY || '' },
                    body: JSON.stringify({ query: args.query }),
                  })
                  result = await res.text()
                } catch {
                  result = JSON.stringify({ error: 'Research unavailable', query: args.query })
                }
              } else if (fnName === 'save_milestone') {
                if (profile) {
                  const { data: existingProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
                  if (existingProfile) {
                    await supabase.from('reminders').insert({
                      profile_id: existingProfile.id,
                      title: args.title as string,
                      description: args.description as string,
                      category: args.category as string,
                      due_date: (args.due_date as string) || null,
                      notify_30_days: true,
                      notify_7_days: true,
                      notify_1_day: true,
                    })
                    result = `Saved "${args.title}" to your CLIFF dashboard. You'll find it in your reminders.`
                  } else {
                    result = 'Could not save — please complete intake first.'
                  }
                } else {
                  result = 'Profile not found. Complete CLIFF intake to save milestones.'
                }
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
            if (textContent) {
              send({ type: 'text', content: textContent })
            }
            continueLoop = false
          }
        }

        send('[DONE]')
        controller.close()
      } catch (err) {
        console.error('Journey agent error:', err)
        send({ type: 'text', content: 'I\'m sorry, something went wrong. Please try again.' })
        send('[DONE]')
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
