import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/email/encrypt'
import { sendGmailMessage, refreshGmailToken } from '@/lib/email/gmail'
import { sendSmtpEmail } from '@/lib/email/smtp'
import { encrypt } from '@/lib/email/encrypt'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body, cc } = await request.json()
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get active email connection
  const { data: connection } = await supabase
    .from('email_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!connection) {
    return NextResponse.json({ error: 'No email connected. Connect Gmail or SMTP first.' }, { status: 400 })
  }

  try {
    const tokens = JSON.parse(decrypt(connection.encrypted_tokens))

    if (connection.provider === 'gmail') {
      // Try with current access token, refresh if needed
      try {
        await sendGmailMessage(tokens.access_token, to, subject, body, cc)
      } catch {
        // Refresh token and retry
        const refreshed = await refreshGmailToken(tokens.refresh_token)
        tokens.access_token = refreshed.access_token

        // Update stored tokens
        await supabase.from('email_connections').update({
          encrypted_tokens: encrypt(JSON.stringify(tokens)),
        }).eq('id', connection.id)

        await sendGmailMessage(tokens.access_token, to, subject, body, cc)
      }
    } else if (connection.provider === 'smtp') {
      await sendSmtpEmail(tokens, to, subject, body, cc)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
