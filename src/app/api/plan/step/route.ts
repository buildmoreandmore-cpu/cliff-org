import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { step_id, is_completed } = await request.json()
  if (!step_id) return NextResponse.json({ error: 'step_id required' }, { status: 400 })

  // Verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const admin = createAdminClient()

  // Verify step belongs to user's plan
  const { data: step } = await admin
    .from('action_plan_steps')
    .select('id, plan_id')
    .eq('id', step_id)
    .single()

  if (!step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })

  const { data: plan } = await admin
    .from('action_plans')
    .select('profile_id')
    .eq('id', step.plan_id)
    .single()

  if (!plan || plan.profile_id !== profile.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await admin
    .from('action_plan_steps')
    .update({
      is_completed: is_completed !== false,
      completed_at: is_completed !== false ? new Date().toISOString() : null,
    })
    .eq('id', step_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
