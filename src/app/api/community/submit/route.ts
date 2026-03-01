import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      submission_type,
      description,
      program_name,
      source_heard_from,
      submitter_email,
      submitter_role,
      submitter_org,
      related_content_block,
      navigator_session_id,
      submitted_by,
      geographic_coverage,
      counties_served,
      who_it_serves,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
    } = body

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.from('community_submissions').insert({
      submission_type: submission_type || 'correction',
      description: description.trim(),
      program_name: program_name || null,
      source_heard_from: source_heard_from || null,
      submitter_email: submitter_email || null,
      submitter_role: submitter_role || null,
      submitter_org: submitter_org || null,
      related_content_block: related_content_block || null,
      navigator_session_id: navigator_session_id || null,
      submitted_by: submitted_by || null,
      geographic_coverage: geographic_coverage || null,
      counties_served: counties_served || null,
      who_it_serves: who_it_serves || null,
      contact_name: contact_name || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      website_url: website_url || null,
    }).select().single()

    if (error) {
      console.error('Community submission error:', error)
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Community submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
