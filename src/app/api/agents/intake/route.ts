import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion, type MiniMaxMessage } from '@/lib/minimax'

const INTAKE_SYSTEM_PROMPT = `You are the CLIFF Intake Assistant — a warm, friendly guide helping Georgia families of children with disabilities get set up with CLIFF Navigator.

Your job is to collect key information by asking ONE question at a time. Be warm, empathetic, and encouraging. Keep responses brief (2-3 sentences max before your question).

Flow (ask these in order, one at a time):
1. First, greet the user warmly. Explain: "CLIFF Navigator helps Georgia families of children with disabilities find and keep the benefits they deserve. I'll ask a few quick questions to personalize your experience." Then ask: "What's your child's name and date of birth?"
2. "What Georgia county do you live in?"
3. "Is your child currently receiving any benefits? (SSI, Medicaid, Katie Beckett waiver, NOW/COMP waiver, school IEP services, other, or none)"
4. "Has your child been diagnosed with a disability? If so, could you briefly describe it?"
5. "What's your biggest concern right now? (Turning 18 soon, turning 21 soon, denied benefits, don't know where to start, or something else)"

After you have ALL the answers, output a JSON block on its own line with this exact format:
\`\`\`json
{"intake_complete": true, "child_name": "...", "child_dob": "YYYY-MM-DD", "county": "...", "current_benefits": ["benefit1", "benefit2"], "disability_description": "...", "primary_concern": "..."}
\`\`\`

Then follow the JSON with a brief, encouraging summary of what you learned.

Rules:
- Ask ONE question at a time. Do not skip ahead.
- If the user gives partial info, gently ask for what's missing.
- For date of birth, accept any reasonable format and convert to YYYY-MM-DD in the JSON.
- For benefits, normalize to: "SSI", "Medicaid", "Katie Beckett", "NOW Waiver", "COMP Waiver", "IEP Services", or the user's own description.
- If the user says "none" for benefits, use an empty array.
- Be patient and supportive. These families are often overwhelmed.`

interface IntakeData {
  intake_complete: boolean
  child_name: string
  child_dob: string
  county: string
  current_benefits: string[]
  disability_description: string
  primary_concern: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { messages, profileId } = body as {
    messages: { role: string; content: string }[]
    profileId: string
  }

  if (!profileId) {
    return new Response('Missing profileId', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        console.log('Intake: starting MiniMax call, profileId:', profileId, 'messages:', messages.length)
        const miniMaxMessages: MiniMaxMessage[] = [
          { role: 'system', content: INTAKE_SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ]

        const response = await chatCompletion(miniMaxMessages)
        let textContent = response.choices[0]?.message?.content || ''
        textContent = textContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

        // Check for intake_complete JSON
        const jsonMatch = textContent.match(/```json\s*(\{[\s\S]*?"intake_complete"\s*:\s*true[\s\S]*?\})\s*```/)
          || textContent.match(/(\{[\s\S]*?"intake_complete"\s*:\s*true[\s\S]*?\})/)

        if (jsonMatch) {
          try {
            const intakeData: IntakeData = JSON.parse(jsonMatch[1])

            // Update profile
            await supabase.from('profiles').update({
              child_name: intakeData.child_name,
              child_dob: intakeData.child_dob,
              county: intakeData.county,
            }).eq('id', profileId)

            // Create child_benefits entries
            for (const benefit of intakeData.current_benefits) {
              await supabase.from('child_benefits').insert({
                profile_id: profileId,
                benefit_name: benefit,
                status: 'active',
              })
            }

            // Create age-based reminders
            await createAgeBasedReminders(supabase, profileId, intakeData.child_dob)

            // Remove the JSON block from the response text
            const cleanText = textContent.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').replace(/\{[\s\S]*?"intake_complete"\s*:\s*true[\s\S]*?\}/, '').trim()

            const summary = cleanText || `Great news! I've set up your profile for ${intakeData.child_name}. Here's what I've recorded:\n\n` +
              `• **Child:** ${intakeData.child_name} (DOB: ${intakeData.child_dob})\n` +
              `• **County:** ${intakeData.county}\n` +
              `• **Current Benefits:** ${intakeData.current_benefits.length > 0 ? intakeData.current_benefits.join(', ') : 'None yet'}\n` +
              `• **Primary Concern:** ${intakeData.primary_concern}\n\n` +
              `I've also set up some important reminders based on ${intakeData.child_name}'s age. Head to your Dashboard to see everything, or start chatting with the Navigator for personalized guidance! 🎉`

            send({ type: 'text', content: summary })
            send({ type: 'intake_complete', data: intakeData })
          } catch (parseErr) {
            console.error('Failed to parse intake JSON:', parseErr)
            send({ type: 'text', content: textContent })
          }
        } else {
          send({ type: 'text', content: textContent })
        }

        send('[DONE]')
        controller.close()
      } catch (err) {
        const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err)
        console.error('Intake agent error:', errMsg)
        send({ type: 'text', content: `I'm sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.` })
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createAgeBasedReminders(supabase: any, profileId: string, childDob: string) {
  const dob = new Date(childDob)
  const now = new Date()
  const ageMs = now.getTime() - dob.getTime()
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)

  const reminders: { title: string; due_date: string; description: string; category: string }[] = []

  // Age 14 — IEP transition planning must begin
  if (ageYears < 14) {
    const fourteenthBday = new Date(dob)
    fourteenthBday.setFullYear(fourteenthBday.getFullYear() + 14)
    reminders.push({
      title: 'IEP Transition Planning Begins',
      due_date: fourteenthBday.toISOString().split('T')[0],
      description: 'By age 14, your child\'s IEP must include transition planning. Request a transition-focused IEP meeting.',
      category: 'milestone',
    })
  }

  // Age 17 — Apply for SSI (adult rules at 18)
  if (ageYears < 17) {
    const seventeenthBday = new Date(dob)
    seventeenthBday.setFullYear(seventeenthBday.getFullYear() + 17)
    reminders.push({
      title: 'Start SSI Adult Application Process',
      due_date: seventeenthBday.toISOString().split('T')[0],
      description: 'At 18, SSI eligibility is re-evaluated under adult rules. Start preparing documentation at 17.',
      category: 'milestone',
    })
  }

  // Age 17.5 — Guardianship/alternatives
  if (ageYears < 17.5) {
    const guardianDate = new Date(dob)
    guardianDate.setFullYear(guardianDate.getFullYear() + 17)
    guardianDate.setMonth(guardianDate.getMonth() + 6)
    reminders.push({
      title: 'Explore Guardianship or Alternatives',
      due_date: guardianDate.toISOString().split('T')[0],
      description: 'Before your child turns 18, decide on guardianship, power of attorney, or supported decision-making.',
      category: 'milestone',
    })
  }

  // Age 18 — Medicaid redetermination
  if (ageYears < 18) {
    const eighteenthBday = new Date(dob)
    eighteenthBday.setFullYear(eighteenthBday.getFullYear() + 18)
    reminders.push({
      title: 'Age 18 Medicaid Redetermination',
      due_date: eighteenthBday.toISOString().split('T')[0],
      description: 'Medicaid eligibility changes at 18. Your child may qualify on their own income. Ensure continuous coverage.',
      category: 'milestone',
    })
  }

  // Age 21 — School services end
  if (ageYears < 21) {
    const twentyFirstBday = new Date(dob)
    twentyFirstBday.setFullYear(twentyFirstBday.getFullYear() + 21)
    reminders.push({
      title: 'School Services End at 21 — Plan Ahead',
      due_date: twentyFirstBday.toISOString().split('T')[0],
      description: 'Public school services end at 21. Ensure waiver services, day programs, or employment supports are in place.',
      category: 'milestone',
    })
  }

  // Age 22 — COMP/NOW waiver transition
  if (ageYears < 22) {
    const twentyTwoBday = new Date(dob)
    twentyTwoBday.setFullYear(twentyTwoBday.getFullYear() + 22)
    reminders.push({
      title: 'Post-School Waiver Transition',
      due_date: twentyTwoBday.toISOString().split('T')[0],
      description: 'If on the NOW/COMP waiver waiting list, follow up on status. Day services become critical after school ends.',
      category: 'milestone',
    })
  }

  for (const reminder of reminders) {
    await supabase.from('reminders').insert({
      profile_id: profileId,
      ...reminder,
      notify_30_days: true,
      notify_7_days: true,
      notify_1_day: true,
    })
  }
}
