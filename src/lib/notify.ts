import { createAdminClient } from '@/lib/supabase/admin'

interface NotifyOptions {
  profileId: string
  triggerType: string
  triggerId?: string
  subject: string
  body: string
}

const NOTIFICATION_PREF_MAP: Record<string, string> = {
  content_change: 'notification_breaking_news',
  breaking_news: 'notification_breaking_news',
  milestone_check: 'notification_milestones',
  weekly_digest: 'notification_digest',
}

/**
 * Insert a notification into the notifications table AND send an email
 * to the user via Composio Gmail if they have email enabled.
 */
export async function notify({ profileId, triggerType, triggerId, subject, body }: NotifyOptions) {
  const supabase = createAdminClient()

  // 1. Insert notification into DB
  await supabase.from('notifications').insert({
    profile_id: profileId,
    trigger_type: triggerType,
    trigger_id: triggerId,
    subject,
    body,
  })

  // 2. Check if user has email/sms notifications enabled
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, notification_email, notification_sms, notification_phone, phone')
    .eq('id', profileId)
    .single()

  if (!profile) return

  // Check notification_email preference (defaults to true if column doesn't exist yet)
  const emailEnabled = profile.notification_email !== false

  // Check type-specific preference — if disabled, skip all delivery
  const prefColumn = NOTIFICATION_PREF_MAP[triggerType]
  if (prefColumn) {
    const { data: prefCheck } = await supabase
      .from('profiles')
      .select(prefColumn)
      .eq('id', profileId)
      .single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (prefCheck && (prefCheck as any)[prefColumn] === false) return
  }

  // 3. Look up user email from auth.users
  const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id)

  // 4. Send email via Composio Gmail
  if (emailEnabled) {
    try {
      await sendEmailViaComposio(user.email, subject, body)
    } catch (err) {
      console.error('Failed to send email notification:', err)
    }
  }

  // 5. Send SMS if enabled and phone exists
  const smsPhone = profile.notification_phone || profile.phone
  if (profile.notification_sms && smsPhone) {
    try {
      await sendSmsViaTelnyx(smsPhone, `CLIFF: ${subject}\n\n${body.replace(/\*\*/g, '').substring(0, 300)}`)
    } catch (err) {
      console.error('Failed to send SMS notification:', err)
    }
  }
}

async function sendEmailViaComposio(to: string, subject: string, body: string) {
  const apiKey = process.env.COMPOSIO_API_KEY
  if (!apiKey) {
    console.warn('COMPOSIO_API_KEY not set, skipping email')
    return
  }

  const connectionId = '18437286-5cc1-41c1-b414-2463391436eb'

  // Convert markdown-ish body to simple HTML
  const htmlBody = body
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^• /gm, '&bull; ')

  const response = await fetch('https://backend.composio.dev/api/v2/actions/GMAIL_SEND_EMAIL/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      connectedAccountId: connectionId,
      input: {
        recipient_email: to,
        subject: subject,
        body: htmlBody,
        sender: 'CLIFF <support@newhyer.com>',
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Composio email failed (${response.status}): ${text}`)
  }
}

async function sendSmsViaTelnyx(to: string, text: string) {
  const apiKey = process.env.TELNYX_API_KEY
  if (!apiKey) {
    console.warn('TELNYX_API_KEY not set, skipping SMS')
    return
  }

  // Clean phone number to E.164
  const cleaned = to.replace(/[^\d+]/g, '')
  const e164 = cleaned.startsWith('+') ? cleaned : cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.TELNYX_FROM_NUMBER || '+17706912043',
      to: e164,
      text,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID || '40019c76-a4f1-48b1-a422-098643c08c38',
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Telnyx SMS failed (${response.status}): ${errText}`)
  }
}
