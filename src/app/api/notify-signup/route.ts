import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = '-1003713142905'
const CLIFF_THREAD_ID = 81

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!TELEGRAM_BOT_TOKEN || !name) {
      return NextResponse.json({ ok: true })
    }

    const text = `🆕 New CLIFF signup!\n\n👤 ${name}\n📧 ${email || 'no email'}\n🕐 ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        message_thread_id: CLIFF_THREAD_ID,
        text,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
