import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getProfileId(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('id').eq('user_id', userId).single()
  return data?.id ?? null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profileId = await getProfileId(supabase, user.id)
  if (!profileId) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('profile_id', profileId)
    .order('due_date')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profileId = await getProfileId(supabase, user.id)
  if (!profileId) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('reminders')
    .insert({ ...body, profile_id: profileId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
