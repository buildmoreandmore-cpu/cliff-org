import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion, type MiniMaxMessage } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'

const INTAKE_SYSTEM_PROMPT = `You are the CLIFF Intake Assistant — a warm, friendly guide helping Georgia families of children and adults with disabilities get set up with CLIFF Navigator.

You have complete knowledge of ALL 48 Georgia disability programs:
${GEORGIA_PROGRAM_KNOWLEDGE}

Your job is to collect key information by asking ONE question at a time. Be warm, empathetic, and encouraging. Keep responses brief (2-3 sentences max before your question).

Flow (ask these in order, one at a time):
1. Greet warmly. Explain: "CLIFF Navigator helps Georgia families of individuals with disabilities find and keep the benefits they deserve. I'll ask a few quick questions to personalize your experience." Then ask: "Are you a parent, guardian, or the individual with a disability navigating for yourself?"
2. "What's your child's (or family member's) name and date of birth?" (If they said 'self' in Q1, ask for their own name and DOB.)
3. "What Georgia county do you live in?"
4. "How many people live in your household, and what's your approximate annual household income? This helps us show which programs you're likely eligible for. You can give a range — under $25k, $25k–$50k, $50k–$75k, $75k–$100k, or over $100k."
5. "Is the individual a U.S. citizen or lawful permanent resident?" (This affects eligibility for SSI, Medicaid, SNAP, and Section 8.)
6. "What is their primary diagnosis or condition?" (This determines the right program track — I/DD like autism/Down syndrome routes differently than physical disability, TBI, or mental health conditions.)
7. "Does their condition primarily involve an intellectual or developmental disability, or is it primarily physical without cognitive impairment?" (This is the single most important routing question — it determines which of Georgia's 7 waiver programs apply.)
8. "Are they medically fragile — meaning do they depend on medical equipment, tube feeding, ventilator, oxygen, or skilled nursing at home?"
9. "What's their current living situation? Do they live at home with family, in a group home, in a nursing facility, or independently?"
10. "Are they currently employed, looking for work, or not working?" (This helps us recommend employment programs like VR, Ticket to Work, and Medicaid Buy-In.)
11. "Do they currently have Medicaid? (Yes, no, or not sure)" (Many waiver programs require active Medicaid.)
12. "Are they currently receiving any OTHER benefits or services? (SSI, Katie Beckett, NOW/COMP waiver, GAPP, IEP services, PeachCare, other, or none)"
13. "Are they currently on a waiver waiting list? (NOW, COMP, both, or no)"
14. "Which Medicaid CMO are they assigned to, if you know? (Amerigroup, CareSource, Peach State, WellCare, or unsure)" (Skip if they said no Medicaid.)
15. "What's your biggest concern right now? (Turning 18 soon, turning 21 soon, denied benefits, lost services, don't know where to start, employment, housing, or something else)"

After you have ALL the answers, output a JSON block on its own line with this exact format:
\`\`\`json
{"intake_complete": true, "relationship": "parent|self|guardian|other", "child_name": "...", "child_dob": "YYYY-MM-DD", "county": "...", "household_size": 4, "household_income": "under_25k|25k_50k|50k_75k|75k_100k|over_100k", "citizenship_status": "citizen|permanent_resident|other", "diagnosis": "...", "disability_track": "idd|physical|tbi|medical|mental_health|sensory|multiple", "medically_fragile": true/false, "living_situation": "home|group_home|nursing_facility|independent", "employment_status": "employed|seeking|not_working", "has_medicaid": true/false, "current_benefits": ["benefit1", "benefit2"], "waiver_waitlist": "now|comp|both|none", "medicaid_cmo": "...", "primary_concern": "..."}
\`\`\`

Then follow the JSON with a brief, encouraging summary and an initial recommendation based on their diagnosis track.

Rules:
- Ask ONE question at a time. Do not skip ahead.
- If the user gives partial info, gently ask for what's missing.
- For date of birth, accept any reasonable format and convert to YYYY-MM-DD in the JSON.
- For benefits, normalize to: "SSI", "Katie Beckett", "NOW Waiver", "COMP Waiver", "GAPP", "IEP Services", "PeachCare", or the user's own description. Do NOT include "Medicaid" in current_benefits — it's captured separately via has_medicaid.
- If the user says "none" for benefits, use an empty array.
- Be patient and supportive. These families are often overwhelmed.
- The disability_track field is critical for routing. Map their answer to the closest: idd (intellectual/developmental), physical (physical without cognitive impairment), tbi (traumatic brain injury), medical (medically fragile/complex), mental_health (SED/psychiatric), sensory (blind/deaf), multiple (combination).
- For household_income, map their answer to the closest bucket: "under_25k" (under $25,000), "25k_50k" ($25,000–$49,999), "50k_75k" ($50,000–$74,999), "75k_100k" ($75,000–$99,999), "over_100k" ($100,000+). If they give a specific number, bucket it.
- For household_size, extract the number of people living in the household. If they say "me and my son," that's 2. Default to 1 if unclear.
- If the user prefers not to share income, set household_income to null and household_size to null. Respect their privacy.
- For relationship: "parent" if they're a parent, "self" if they're the individual with a disability, "guardian" if a legal guardian, "other" for anyone else.
- For citizenship_status: "citizen" for U.S. citizen, "permanent_resident" for green card holder / lawful permanent resident, "other" for anything else. If they decline, set null.
- For living_situation: "home" (lives with family), "group_home", "nursing_facility", or "independent" (lives alone or with roommates, not family care).
- For employment_status: "employed" (working any amount), "seeking" (looking for work), "not_working" (not working and not looking, e.g., child, retired, unable).
- For has_medicaid: true/false. If "not sure", set false.
- For waiver_waitlist: "now", "comp", "both", or "none". If they're not on any waitlist, set "none".
- If they say no Medicaid in Q11, skip the Medicaid CMO question and set medicaid_cmo to null.`

interface IntakeData {
  intake_complete: boolean
  relationship: string
  child_name: string
  child_dob: string
  county: string
  household_size: number | null
  household_income: string | null
  citizenship_status: string | null
  diagnosis: string
  disability_track: string
  medically_fragile: boolean
  living_situation: string | null
  employment_status: string | null
  has_medicaid: boolean
  current_benefits: string[]
  waiver_waitlist: string | null
  medicaid_cmo: string | null
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
        const userMessages = messages.length === 0
          ? [{ role: 'user' as const, content: 'Hi, I\'m new here. Help me get started.' }]
          : messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

        const miniMaxMessages: MiniMaxMessage[] = [
          { role: 'system', content: INTAKE_SYSTEM_PROMPT },
          ...userMessages,
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

            // Update profile with all intake fields
            await supabase.from('profiles').update({
              relationship: intakeData.relationship,
              child_name: intakeData.child_name,
              child_dob: intakeData.child_dob,
              county: intakeData.county,
              household_income: intakeData.household_income,
              household_size: intakeData.household_size,
              citizenship_status: intakeData.citizenship_status,
              diagnosis: intakeData.diagnosis,
              disability_track: intakeData.disability_track,
              medically_fragile: intakeData.medically_fragile,
              living_situation: intakeData.living_situation,
              employment_status: intakeData.employment_status,
              has_medicaid: intakeData.has_medicaid,
              waiver_waitlist: intakeData.waiver_waitlist,
              medicaid_cmo: intakeData.medicaid_cmo,
              primary_concern: intakeData.primary_concern,
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

            // Auto-generate action plan in the background
            try {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
              fetch(`${baseUrl}/api/plan/generate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Cookie: request.headers.get('cookie') || '',
                },
              }).catch(() => { /* background fire-and-forget */ })
            } catch { /* ignore plan generation failures */ }

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
