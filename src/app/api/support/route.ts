import { NextRequest, NextResponse } from 'next/server'

const SUPPORT_EMAIL = 'support@newhyer.com'
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY
const GMAIL_CONNECTION_ID = '18437286-5cc1-41c1-b414-2463391436eb'

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = (await request.json()) as {
    name: string
    email: string
    subject: string
    message: string
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  if (!COMPOSIO_API_KEY) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 503 })
  }

  try {
    const emailSubject = subject?.trim()
      ? `[CLIFF Support] ${subject.trim()}`
      : `[CLIFF Support] New message from ${name}`

    const emailBody = `New support request from CLIFF (meetcliff.org):\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || '(none)'}\n\n---\n\n${message}\n\n---\nReply directly to this email to respond to ${name} at ${email}.`

    const res = await fetch('https://backend.composio.dev/api/v2/actions/GMAIL_SEND_EMAIL/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': COMPOSIO_API_KEY,
      },
      body: JSON.stringify({
        connectedAccountId: GMAIL_CONNECTION_ID,
        input: {
          recipient_email: SUPPORT_EMAIL,
          subject: emailSubject,
          body: emailBody,
          reply_to: email,
        },
      }),
    })

    if (!res.ok) {
      const errData = await res.text()
      console.error('Composio send error:', errData)
      throw new Error('Email send failed')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Support email error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
