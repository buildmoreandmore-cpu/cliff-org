import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const SUPPORT_EMAIL = 'support@newhyer.com'

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

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 503 })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })

    await transporter.sendMail({
      from: `"CLIFF Support Form" <${smtpUser}>`,
      replyTo: `"${name}" <${email}>`,
      to: SUPPORT_EMAIL,
      subject: subject?.trim() ? `[CLIFF Support] ${subject.trim()}` : `[CLIFF Support] New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Support email error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
