import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { tip_id, name, email, message } = await request.json()

  if (!tip_id || !name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Tip ID, name, and email are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get the tip to find the author's contact info
  const { data: tip } = await supabase
    .from('community_tips')
    .select('id, parent_name, email, phone')
    .eq('id', tip_id)
    .single()

  if (!tip) {
    return NextResponse.json({ error: 'Tip not found' }, { status: 404 })
  }

  if (!tip.email && !tip.phone) {
    return NextResponse.json({ error: 'This parent did not leave contact info' }, { status: 400 })
  }

  // Save the connect request
  const { error } = await supabase.from('connect_requests').insert({
    tip_id,
    requester_name: name.trim(),
    requester_email: email.trim(),
    message: message?.trim() || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify the tip author via email if they have one
  if (tip.email) {
    try {
      const apiKey = process.env.COMPOSIO_API_KEY
      if (apiKey) {
        await fetch('https://backend.composio.dev/api/v2/actions/GMAIL_SEND_EMAIL/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            connectedAccountId: '18437286-5cc1-41c1-b414-2463391436eb',
            input: {
              recipient_email: tip.email,
              subject: `Someone on CLIFF wants to connect with you`,
              body: `Hi ${tip.parent_name},\n\nA parent on CLIFF's Family Advice Board would like to connect with you about your post.\n\nFrom: ${name}\nEmail: ${email}\n${message ? `Message: ${message}\n` : ''}\nIf you'd like to connect, simply reply to them at ${email}. If not, no action needed — your contact info is still private.\n\nThank you for helping other families.\n— CLIFF (meetcliff.org)`,
            },
          }),
        })
      }
    } catch (err) {
      console.error('Failed to notify tip author:', err)
    }
  }

  return NextResponse.json({ success: true })
}
