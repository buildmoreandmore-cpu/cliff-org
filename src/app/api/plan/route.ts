import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: plan } = await supabase
    .from('action_plans')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('is_current', true)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (!plan) return NextResponse.json({ plan: null, steps: [] })

  const { data: steps } = await supabase
    .from('action_plan_steps')
    .select('*')
    .eq('plan_id', plan.id)
    .order('step_number')

  return NextResponse.json({ plan, steps: steps || [] })
}
