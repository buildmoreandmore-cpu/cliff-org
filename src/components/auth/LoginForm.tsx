'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if profile is complete — if not, go to intake
    const { data: profile } = await supabase
      .from('profiles')
      .select('child_name')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (!profile?.child_name) {
      router.push('/intake')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="Your password"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-sm text-navy/50 text-center">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-coral hover:text-coral-dark font-medium">
          Sign up
        </Link>
      </p>
    </form>
  )
}
