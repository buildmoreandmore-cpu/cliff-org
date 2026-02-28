import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeGmailCode } from '@/lib/email/gmail'
import { encrypt } from '@/lib/email/encrypt'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url))

  try {
    const tokens = await exchangeGmailCode(code)

    if (tokens.error) {
      return NextResponse.redirect(new URL('/dashboard?error=gmail_auth_failed', request.url))
    }

    // Get user's Gmail address
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userInfoRes.json()

    // Deactivate existing Gmail connections
    await supabase
      .from('email_connections')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('provider', 'gmail')

    // Save new connection
    await supabase.from('email_connections').insert({
      user_id: user.id,
      provider: 'gmail',
      email_address: userInfo.email,
      encrypted_tokens: encrypt(JSON.stringify(tokens)),
      is_active: true,
    })

    return NextResponse.redirect(new URL('/dashboard?gmail=connected', request.url))
  } catch (err) {
    console.error('Gmail callback error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=gmail_callback', request.url))
  }
}
