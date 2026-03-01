import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const category = request.nextUrl.searchParams.get('category')

  let query = supabase
    .from('community_tips')
    .select('id, parent_name, county, category, title, body, created_at, email, phone')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (category) {
    query = query.eq('category', category)
  }

  const { data: tips, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map tips to hide contact info but indicate if it exists
  const safeTips = (tips || []).map(tip => ({
    id: tip.id,
    parent_name: tip.parent_name,
    county: tip.county,
    category: tip.category,
    title: tip.title,
    body: tip.body,
    has_contact: !!(tip.email || tip.phone),
    created_at: tip.created_at,
  }))

  return NextResponse.json({ tips: safeTips })
}

export async function POST(request: NextRequest) {
  const { parent_name, county, category, title, body, email, phone } = await request.json()

  if (!parent_name?.trim() || !category?.trim() || !title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Name, category, title, and advice are required' }, { status: 400 })
  }

  // Basic validation
  if (body.length > 5000) {
    return NextResponse.json({ error: 'Advice must be under 5,000 characters' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('community_tips').insert({
    parent_name: parent_name.trim(),
    county: county?.trim() || null,
    category: category.trim(),
    title: title.trim(),
    body: body.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    is_approved: true, // Auto-approve for now; can add moderation later
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
