import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/minimax'

interface HipaaComplaintRequest {
  profileId: string
  violation_type: string
  entity_name: string
  entity_type?: string
  description: string
  approximate_date?: string
  records_requested?: boolean
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as HipaaComplaintRequest
  const { profileId, violation_type, entity_name, entity_type, description, approximate_date, records_requested } = body

  if (!profileId || !violation_type || !entity_name || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get profile for complaint personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('parent_name, child_name, county, phone')
    .eq('id', profileId)
    .single()

  try {
    const response = await chatCompletion([
      {
        role: 'system',
        content: `You are a HIPAA complaint drafting assistant for CLIFF, a Georgia disability benefits nonprofit. 
You help families draft complaints to the HHS Office for Civil Rights (OCR).

You produce TWO outputs:
1. A ready-to-file complaint letter
2. A checklist of supporting documents the family should gather

IMPORTANT: You are NOT providing legal advice. You are helping organize facts into the format OCR expects.
Always recommend the family consult Georgia Legal Services (1-800-498-9469) for complex cases.

The complaint must include:
- Complainant's name and contact info (use placeholders where info is missing)
- Name and address of the entity that violated HIPAA
- Description of the acts or omissions believed to violate HIPAA
- Approximate date(s) of the violation
- Signature line

Format the complaint as a formal letter addressed to:
HHS Office for Civil Rights
200 Independence Avenue SW, Room 509F HHH Building
Washington, DC 20201

Also include the online filing URL: https://ocrportal.hhs.gov/ocr/smartscreen/main.jsf`,
      },
      {
        role: 'user',
        content: `Generate a HIPAA complaint draft for this family:

Family contact: ${profile?.parent_name || '[YOUR NAME]'}
County: ${profile?.county || '[COUNTY]'}, Georgia
Phone: ${profile?.phone || '[PHONE]'}
Child/Individual: ${profile?.child_name || '[INDIVIDUAL NAME]'}

Violation type: ${violation_type.replace(/_/g, ' ')}
Entity name: ${entity_name}
Entity type: ${entity_type?.replace(/_/g, ' ') || 'healthcare provider'}
What happened: ${description}
Approximate date: ${approximate_date || 'Not specified'}
Has family formally requested records in writing? ${records_requested ? 'Yes' : 'No / Unknown'}

Generate:
1. The complaint letter (ready to print, sign, and mail or paste into the OCR online form)
2. A checklist of supporting documents to gather
3. Key deadlines to be aware of (180-day filing window from the violation date)
4. Alternative actions they can take simultaneously (state AG complaint, insurance commissioner, etc.)`,
      },
    ])

    let content = response.choices[0]?.message?.content || ''
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    // Save the complaint draft as a document
    await supabase.from('saved_documents').insert({
      profile_id: profileId,
      doc_type: 'other',
      title: `HIPAA Complaint Draft: ${entity_name}`,
      content: JSON.stringify({
        violation_type,
        entity_name,
        entity_type,
        description,
        approximate_date,
        complaint_draft: content,
        generated_at: new Date().toISOString(),
      }),
    })

    // Create a reminder for the 180-day filing deadline if we have a date
    if (approximate_date) {
      const violationDate = new Date(approximate_date)
      if (!isNaN(violationDate.getTime())) {
        const deadline = new Date(violationDate)
        deadline.setDate(deadline.getDate() + 180)
        const now = new Date()

        if (deadline > now) {
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          await supabase.from('reminders').insert({
            profile_id: profileId,
            title: `HIPAA Complaint Deadline: ${entity_name}`,
            due_date: deadline.toISOString().split('T')[0],
            description: `You have ${daysLeft} days to file a HIPAA complaint with HHS OCR about ${entity_name}. File online: https://ocrportal.hhs.gov or call 1-800-368-1019.`,
            category: 'hipaa',
            notify_30_days: true,
            notify_7_days: true,
            notify_1_day: true,
          })
        }
      }
    }

    // Create notification
    await supabase.from('notifications').insert({
      profile_id: profileId,
      trigger_type: 'hipaa_complaint_generated',
      subject: `HIPAA Complaint Draft Ready: ${entity_name}`,
      body: `Your HIPAA complaint draft against ${entity_name} has been generated. You can find it in your Documents. Remember to file within 180 days of the violation. File online at https://ocrportal.hhs.gov or call HHS OCR at 1-800-368-1019.`,
    })

    return NextResponse.json({
      success: true,
      complaint_draft: content,
      entity_name,
      violation_type,
      filing_url: 'https://ocrportal.hhs.gov/ocr/smartscreen/main.jsf',
      ocr_phone: '1-800-368-1019',
    })
  } catch (err) {
    console.error('HIPAA complaint generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'HIPAA complaint generation failed' },
      { status: 500 }
    )
  }
}
