import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: bills, error } = await supabase
    .from('content_blocks')
    .select('*')
    .like('slug', 'bill-%')
    .eq('is_published', true)
    .order('last_verified', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bills: bills || [] })
}
