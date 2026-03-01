import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/minimax'
import { GEORGIA_PROGRAM_KNOWLEDGE } from '@/data/program-knowledge'

type DocumentType = 'denial_letter' | 'iep' | 'waiver_determination' | 'medical_record' | 'other'

const PROMPTS: Record<DocumentType, string> = {
  denial_letter: `You are analyzing a DENIAL LETTER for a Georgia disability benefit application. You have complete knowledge of all Georgia disability programs:
${GEORGIA_PROGRAM_KNOWLEDGE}

Use this knowledge to suggest alternative programs the family should apply for based on the denial. For example, if denied for NOW/COMP, suggest ICWP if the disability is physical. If denied SSI, suggest Katie Beckett. Always include specific phone numbers.

Extract the following as JSON:
{
  "program_denied": "name of program/benefit denied",
  "denial_reason": "specific reason given",
  "denial_date": "YYYY-MM-DD or null",
  "appeal_deadline": "YYYY-MM-DD or null",
  "denial_codes": ["any codes or reference numbers"],
  "key_language": "exact denial language that may be important for appeal",
  "appeal_viable": true/false,
  "appeal_reasoning": "why appeal may or may not succeed",
  "recommended_next_steps": ["step1", "step2"],
  "summary": "2-3 sentence plain-language summary for a parent"
}

Be precise with dates. If the appeal deadline isn't explicit, calculate from the denial date (Georgia typically allows 30 days for Medicaid, 60 days for SSI). Mark appeal_viable as true if the denial seems based on missing documentation or procedural issues.`,

  iep: `You are analyzing an IEP (Individualized Education Program) document. You know all Georgia disability programs and transition pathways:
- GVRA should be contacted during transition (before school exit): 844-367-4872
- DBHDD Planning List for NOW/COMP waiver if I/DD: (404) 657-2252
- ICWP if physical disability without I/DD: Alliant 888-669-7195
- ABLE account should be opened: georgiastable.com
- Section 8/811 housing application should start NOW
- Guardianship/alternatives should be explored by age 17

Extract the following as JSON:
{
  "student_name": "name or null",
  "school": "school name or null",
  "grade": "grade level or null",
  "disability_category": "primary disability category",
  "services": [{"service": "name", "frequency": "how often", "duration": "how long"}],
  "accommodations": ["list of accommodations"],
  "transition_goals": ["goals if age 14+, empty if not present or not applicable"],
  "meeting_date": "YYYY-MM-DD or null",
  "next_review_date": "YYYY-MM-DD or null",
  "gaps_identified": ["potential gaps or missing elements"],
  "recommendations": ["things the parent should consider requesting"],
  "summary": "2-3 sentence summary for a parent"
}

Common IEP gaps to flag: missing transition plan for students 14+, vague or unmeasurable goals, insufficient service hours, missing assistive technology consideration, no extended school year (ESY) consideration.`,

  waiver_determination: `You are analyzing a WAIVER DETERMINATION letter from a Georgia agency. You know all 7 Georgia Medicaid waivers: NOW, COMP, ICWP, SOURCE, CCSP, EDWP, GAPP. If denied one waiver, suggest others based on the individual's condition. Extract the following as JSON:
{
  "waiver_type": "NOW or COMP or other",
  "determination_result": "approved/denied/waitlisted/planning_list",
  "planning_list_date": "YYYY-MM-DD or null",
  "estimated_wait_time": "description or null",
  "assigned_coordinator": {"name": "or null", "email": "or null", "phone": "or null"},
  "services_approved": ["list of approved services if applicable"],
  "next_steps": ["what the family should do next"],
  "summary": "2-3 sentence plain-language explanation of what this means"
}

Note: NOW waiver is for individuals with less intensive needs; COMP waiver is for more intensive needs. Georgia's waiting lists can be years long. If placed on a planning list, emphasize the importance of keeping contact info current and responding to all correspondence.`,

  medical_record: `You are analyzing a MEDICAL RECORD related to a disability determination. Extract the following as JSON:
{
  "patient_name": "name or null",
  "provider": "doctor/clinic name or null",
  "date": "YYYY-MM-DD or null",
  "diagnoses": ["list of diagnoses with codes if present"],
  "functional_limitations": ["described limitations"],
  "recommended_supports": ["recommended therapies, equipment, or services"],
  "key_findings": "important clinical findings in plain language",
  "summary": "2-3 sentence summary for a parent"
}`,

  other: `You are analyzing a document related to Georgia disability benefits/services. Extract whatever structured information you can as JSON:
{
  "document_type_detected": "what type of document this appears to be",
  "key_dates": [{"label": "description", "date": "YYYY-MM-DD"}],
  "key_people": [{"name": "name", "role": "role", "contact": "contact info if present"}],
  "action_items": ["things that need attention"],
  "deadlines": [{"item": "description", "date": "YYYY-MM-DD"}],
  "summary": "2-3 sentence summary for a parent"
}`,
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profileId, documentText, documentType, filename } = await request.json() as {
    profileId: string
    documentText: string
    documentType: DocumentType
    filename: string
  }

  if (!profileId || !documentText || !documentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const prompt = PROMPTS[documentType] || PROMPTS.other

    const response = await chatCompletion([
      { role: 'system', content: prompt },
      { role: 'user', content: `Document filename: ${filename}\n\nDocument content:\n${documentText}` },
    ])

    let rawContent = response.choices[0]?.message?.content || ''
    rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    // Extract JSON from response
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/(\{[\s\S]*\})/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to extract structured data from document' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let extracted: any
    try {
      extracted = JSON.parse(jsonMatch[1])
    } catch {
      return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 })
    }

    // Save document to saved_documents
    await supabase.from('saved_documents').insert({
      profile_id: profileId,
      doc_type: 'other',
      title: `${documentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: ${filename}`,
      content: JSON.stringify({ extracted, original_text: documentText.substring(0, 5000) }),
    })

    // Document-type-specific Supabase updates
    if (documentType === 'denial_letter' && extracted.program_denied) {
      // Update or create application
      await supabase.from('applications').upsert({
        profile_id: profileId,
        program_name: extracted.program_denied,
        status: 'denied',
        denial_reason: extracted.denial_reason || null,
        appeal_deadline: extracted.appeal_deadline || null,
      }, { onConflict: 'profile_id,program_name' })

      // Create appeal reminder if deadline exists and is within 60 days
      if (extracted.appeal_deadline) {
        const deadline = new Date(extracted.appeal_deadline)
        const now = new Date()
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysRemaining > 0 && daysRemaining <= 60) {
          await supabase.from('reminders').insert({
            profile_id: profileId,
            title: `URGENT: Appeal deadline for ${extracted.program_denied}`,
            due_date: extracted.appeal_deadline,
            description: `You have ${daysRemaining} days to file an appeal. Denial reason: ${extracted.denial_reason || 'See letter'}`,
            category: 'appeal',
            notify_30_days: true,
            notify_7_days: true,
            notify_1_day: true,
          })
        }

        // Create notification
        await supabase.from('notifications').insert({
          profile_id: profileId,
          trigger_type: 'document_processed',
          subject: `${extracted.program_denied} Denial Letter Processed`,
          body: `Your denial letter has been analyzed. ${daysRemaining > 0 ? `You have ${daysRemaining} days to appeal.` : 'The appeal deadline may have passed.'} ${extracted.appeal_viable ? 'An appeal may be viable.' : ''}`,
        })
      }
    }

    if (documentType === 'iep') {
      // Update profile if student name found
      if (extracted.student_name) {
        const { data: profile } = await supabase.from('profiles').select('child_name').eq('id', profileId).single()
        if (!profile?.child_name) {
          await supabase.from('profiles').update({ child_name: extracted.student_name }).eq('id', profileId)
        }
      }

      // Create IEP review reminder
      if (extracted.meeting_date) {
        const meetingDate = new Date(extracted.meeting_date)
        const reviewDate = new Date(meetingDate)
        reviewDate.setFullYear(reviewDate.getFullYear() + 1)

        await supabase.from('reminders').insert({
          profile_id: profileId,
          title: 'Annual IEP Review Due',
          due_date: reviewDate.toISOString().split('T')[0],
          description: `Annual IEP review is due. Last IEP meeting: ${extracted.meeting_date}. Services: ${(extracted.services || []).map((s: { service: string }) => s.service).join(', ')}`,
          category: 'iep',
          notify_30_days: true,
          notify_7_days: true,
          notify_1_day: true,
        })
      }
    }

    if (documentType === 'waiver_determination') {
      const status = extracted.determination_result === 'approved' ? 'approved'
        : extracted.determination_result === 'denied' ? 'denied'
        : 'under_review'

      const appData: Record<string, unknown> = {
        profile_id: profileId,
        program_name: `${extracted.waiver_type || 'Unknown'} Waiver`,
        status,
        planning_list_date: extracted.planning_list_date || null,
      }

      if (extracted.assigned_coordinator) {
        appData.coordinator_name = extracted.assigned_coordinator.name || null
        appData.coordinator_email = extracted.assigned_coordinator.email || null
        appData.coordinator_phone = extracted.assigned_coordinator.phone || null
      }

      await supabase.from('applications').upsert(appData, { onConflict: 'profile_id,program_name' })

      // 6-month follow-up reminder
      const followUp = new Date()
      followUp.setMonth(followUp.getMonth() + 6)

      await supabase.from('reminders').insert({
        profile_id: profileId,
        title: `Follow up on ${extracted.waiver_type || ''} Waiver Status`,
        due_date: followUp.toISOString().split('T')[0],
        description: `Check on waiver status. ${extracted.estimated_wait_time ? `Estimated wait: ${extracted.estimated_wait_time}.` : ''} ${extracted.assigned_coordinator?.name ? `Coordinator: ${extracted.assigned_coordinator.name}` : ''}`,
        category: 'waiver',
        notify_30_days: false,
        notify_7_days: true,
        notify_1_day: true,
      })
    }

    return NextResponse.json({
      success: true,
      documentType,
      filename,
      analysis: extracted,
    })
  } catch (err) {
    console.error('Document intelligence error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Document analysis failed' },
      { status: 500 }
    )
  }
}
