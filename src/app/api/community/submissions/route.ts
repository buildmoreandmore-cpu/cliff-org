import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET — list submissions (admin)
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  const limit = parseInt(searchParams.get('limit') || '50')

  const supabase = createAdminClient()
  let query = supabase.from('community_submissions').select('*').order('created_at', { ascending: false }).limit(limit)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH — update submission status (admin)
export async function PATCH(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status, research_notes, rejection_reason, added_to_content_block, assigned_to, priority } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (status) {
    updates.status = status
    if (['verified', 'added', 'rejected', 'duplicate'].includes(status)) {
      updates.resolved_at = new Date().toISOString()
    }
    if (['researching', 'verified'].includes(status)) {
      updates.reviewed_at = new Date().toISOString()
    }
  }
  if (research_notes !== undefined) updates.research_notes = research_notes
  if (rejection_reason !== undefined) updates.rejection_reason = rejection_reason
  if (added_to_content_block !== undefined) updates.added_to_content_block = added_to_content_block
  if (assigned_to !== undefined) updates.assigned_to = assigned_to
  if (priority !== undefined) updates.priority = priority

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('community_submissions').update(updates).eq('id', id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
