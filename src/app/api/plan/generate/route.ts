import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatCompletion } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

function daysUntilBirthday(dob: string, targetAge: number): number | null {
  if (!dob) return null
  const born = new Date(dob)
  const target = new Date(born)
  target.setFullYear(born.getFullYear() + targetAge)
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Get benefits, applications, reminders
  const admin = createAdminClient()
  const [benefitsRes, appsRes, remindersRes] = await Promise.all([
    admin.from('child_benefits').select('*').eq('profile_id', profile.id),
    admin.from('applications').select('*').eq('profile_id', profile.id),
    admin.from('reminders').select('*').eq('profile_id', profile.id).order('due_date'),
  ])

  const days18 = daysUntilBirthday(profile.child_dob, 18)
  const days21 = daysUntilBirthday(profile.child_dob, 21)

  const contextBlock = `
FAMILY PROFILE:
- Child Name: ${profile.child_name || 'Unknown'}
- Date of Birth: ${profile.child_dob || 'Unknown'}
- Age: ${profile.child_dob ? Math.floor((Date.now() - new Date(profile.child_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'}
- County: ${profile.county || 'Unknown'}
- Diagnosis: ${profile.diagnosis || 'Unknown'}
- Disability Track: ${profile.disability_track || 'Unknown'}
- Medically Fragile: ${profile.medically_fragile ? 'Yes' : 'No'}
- Medicaid CMO: ${profile.medicaid_cmo || 'None'}
- Has Medicaid: ${profile.has_medicaid === true ? 'Yes' : profile.has_medicaid === false ? 'No' : 'Unknown'}
- Relationship: ${profile.relationship || 'Unknown'}
- Citizenship Status: ${profile.citizenship_status || 'Unknown'}
- Living Situation: ${profile.living_situation || 'Unknown'}
- Employment Status: ${profile.employment_status || 'Unknown'}
- Waiver Waitlist: ${profile.waiver_waitlist || 'Unknown'}
- Household Income: ${profile.household_income || 'Unknown'}
- Household Size: ${profile.household_size || 'Unknown'}
- Primary Concern: ${profile.primary_concern || 'None specified'}
- Days until 18th birthday: ${days18 !== null ? (days18 > 0 ? days18 : 'Already passed') : 'Unknown'}
- Days until 21st birthday: ${days21 !== null ? (days21 > 0 ? days21 : 'Already passed') : 'Unknown'}

CURRENT BENEFITS: ${JSON.stringify(benefitsRes.data || [])}
CURRENT APPLICATIONS: ${JSON.stringify(appsRes.data || [])}
UPCOMING REMINDERS: ${JSON.stringify(remindersRes.data || [])}
`

  const systemPrompt = `You are CLIFF's Action Plan Generator for Georgia families with disabilities. Generate a personalized, prioritized action plan.

${GEORGIA_PROGRAM_KNOWLEDGE}

RULES:
1. If has_medicaid is false/No, step 1 MUST be "Apply for Medicaid" — it's the gateway to everything else.
2. If citizenship_status is "other" (not citizen/permanent_resident), do NOT recommend SSI or Medicaid.
3. If living_situation is "nursing_facility", skip community waiver recommendations.
4. If employment_status is "not_working", skip Ticket to Work recommendations.
5. If waiver_waitlist includes a waiver, don't recommend applying for that waiver again.
6. For children approaching 18 (within 365 days), include SSI adult conversion, guardianship, voter registration.
7. For children approaching 21 (within 365 days), include transition planning, waiver services, employment planning.
8. Use household_income and household_size for FPL% context.
9. Include SPECIFIC phone numbers and websites for every step.
10. Order by urgency: this_week > two_weeks > one_month > three_months > ongoing.

Return ONLY a JSON array (no markdown, no explanation) of objects with these exact fields:
- step_number (integer, starting at 1)
- urgency (one of: "this_week", "two_weeks", "one_month", "three_months", "ongoing")
- title (short, action-oriented)
- description (2-3 sentences: what to do, why it matters, what to expect)
- phone_number (if applicable, format: "(xxx) xxx-xxxx")
- website (if applicable, full URL)
- program_slug (if related to a specific program, e.g. "medicaid", "ssi", "now_waiver")
- due_date (ISO date string if there's a deadline, null otherwise)

Generate 8-15 steps. Be specific to THIS family's situation.`

  const response = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextBlock },
  ])

  const raw = stripThinkTags(response.choices[0].message.content)

  let steps: Array<{
    step_number: number
    urgency: string
    title: string
    description: string
    phone_number: string | null
    website: string | null
    program_slug: string | null
    due_date: string | null
  }>

  try {
    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    steps = JSON.parse(jsonMatch[0])
  } catch {
    return NextResponse.json({ error: 'Failed to parse plan from AI', raw }, { status: 500 })
  }

  // Mark previous plans as not current
  await admin
    .from('action_plans')
    .update({ is_current: false })
    .eq('profile_id', profile.id)
    .eq('is_current', true)

  // Insert new plan
  const { data: plan, error: planError } = await admin
    .from('action_plans')
    .insert({
      profile_id: profile.id,
      steps: steps,
      is_current: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (planError) return NextResponse.json({ error: planError.message }, { status: 500 })

  // Insert steps
  const stepRows = steps.map((s) => ({
    plan_id: plan.id,
    step_number: s.step_number,
    urgency: s.urgency,
    title: s.title,
    description: s.description,
    phone_number: s.phone_number,
    website: s.website,
    program_slug: s.program_slug,
    due_date: s.due_date,
  }))

  const { data: insertedSteps, error: stepsError } = await admin
    .from('action_plan_steps')
    .insert(stepRows)
    .select()

  if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 })

  return NextResponse.json({ plan, steps: insertedSteps })
}
