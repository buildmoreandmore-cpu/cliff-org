import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionType = 'sign' | 'submit' | 'snooze' | 'send_email' | 'send_sms' | 'mark_ready'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, phone, parent_name')
    .eq('user_id', user.id)
    .single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const body = await request.json()
  const { document_id, action, signature_data, snooze_days, recipient_email, subject } = body as {
    document_id: string
    action: ActionType
    signature_data?: string
    snooze_days?: number
    recipient_email?: string
    subject?: string
  }

  if (!document_id || !action) {
    return NextResponse.json({ error: 'document_id and action required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify document belongs to this profile
  const { data: doc } = await admin
    .from('saved_documents')
    .select('*')
    .eq('id', document_id)
    .eq('profile_id', profile.id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  switch (action) {
    case 'sign': {
      if (!signature_data) return NextResponse.json({ error: 'signature_data required' }, { status: 400 })
      await admin.from('saved_documents').update({
        signed_at: new Date().toISOString(),
        signature_data,
        submission_status: 'ready',
      }).eq('id', document_id)

      // Create notification
      await admin.from('notifications').insert({
        profile_id: profile.id,
        trigger_type: 'document_signed',
        subject: `✅ ${doc.title} — Signed & Ready to Submit`,
        body: `Your document "${doc.title}" has been signed and is ready to submit. Head to your Documents to send it.`,
      })

      return NextResponse.json({ success: true, status: 'ready' })
    }

    case 'mark_ready': {
      await admin.from('saved_documents').update({
        submission_status: 'ready',
      }).eq('id', document_id)
      return NextResponse.json({ success: true, status: 'ready' })
    }

    case 'submit': {
      await admin.from('saved_documents').update({
        submission_status: 'submitted',
        is_sent: true,
        sent_at: new Date().toISOString(),
        sent_via: 'manual',
      }).eq('id', document_id)
      return NextResponse.json({ success: true, status: 'submitted' })
    }

    case 'snooze': {
      const days = snooze_days || 3
      const snoozedUntil = new Date()
      snoozedUntil.setDate(snoozedUntil.getDate() + days)
      await admin.from('saved_documents').update({
        snoozed_until: snoozedUntil.toISOString(),
      }).eq('id', document_id)
      return NextResponse.json({ success: true, snoozed_until: snoozedUntil.toISOString() })
    }

    case 'send_email': {
      const toEmail = recipient_email || doc.recipient_email
      if (!toEmail) return NextResponse.json({ error: 'No recipient email' }, { status: 400 })

      const apiKey = process.env.COMPOSIO_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })

      // Parse content for the complaint/letter body
      let emailBody = ''
      try {
        const parsed = JSON.parse(doc.content)
        emailBody = parsed.complaint_draft || parsed.extracted?.body || doc.content
      } catch {
        emailBody = doc.content
      }

      // Add signature if signed
      if (doc.signature_data) {
        emailBody += `\n\nSigned by: ${profile.parent_name || 'Family Member'}\nDate: ${new Date(doc.signed_at || Date.now()).toLocaleDateString()}`
      }

      const htmlBody = emailBody.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      const connectionId = '18437286-5cc1-41c1-b414-2463391436eb'
      const res = await fetch('https://backend.composio.dev/api/v2/actions/GMAIL_SEND_EMAIL/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({
          connectedAccountId: connectionId,
          input: {
            recipient_email: toEmail,
            subject: subject || doc.subject || doc.title,
            body: htmlBody,
            sender: `CLIFF on behalf of ${profile.parent_name || 'Family'} <support@newhyer.com>`,
          },
        }),
      })

      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      await admin.from('saved_documents').update({
        submission_status: 'submitted',
        is_sent: true,
        sent_at: new Date().toISOString(),
        sent_via: 'email',
      }).eq('id', document_id)

      return NextResponse.json({ success: true, sent_to: toEmail })
    }

    case 'send_sms': {
      const phone = profile.phone
      if (!phone) return NextResponse.json({ error: 'No phone number on profile' }, { status: 400 })

      // For SMS, send a short reminder with the filing URL
      const filingUrl = doc.filing_url || 'https://ocrportal.hhs.gov'
      const message = `CLIFF: Your "${doc.title}" is ready to submit. File here: ${filingUrl} — or open your CLIFF dashboard to send it by email.`

      // Use Telnyx
      const telnyxKey = process.env.TELNYX_API_KEY
      if (!telnyxKey) return NextResponse.json({ error: 'SMS not configured' }, { status: 500 })

      const smsRes = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${telnyxKey}` },
        body: JSON.stringify({
          from: process.env.TELNYX_NUMBER || '+17706912043',
          to: phone,
          text: message,
          messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID || '40019c76-a4f1-48b1-a422-098643c08c38',
        }),
      })

      return NextResponse.json({ success: smsRes.ok, method: 'sms' })
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}
