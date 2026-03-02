'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    parentName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          parent_name: form.parentName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Notify team of new signup (fire-and-forget)
    fetch('/api/notify-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.parentName, email: form.email }),
    }).catch(() => {})

    // Go straight to intake — the AI will ask the rest
    router.push('/intake')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="parentName" className="block text-sm font-medium text-navy mb-1.5">
          Your Name
        </label>
        <input
          id="parentName"
          type="text"
          required
          value={form.parentName}
          onChange={(e) => update('parentName', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="Parent / guardian name"
        />
      </div>

      <div>
        <label htmlFor="signupEmail" className="block text-sm font-medium text-navy mb-1.5">
          Email
        </label>
        <input
          id="signupEmail"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label htmlFor="signupPassword" className="block text-sm font-medium text-navy mb-1.5">
          Password
        </label>
        <input
          id="signupPassword"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="Minimum 6 characters"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Get Started'}
      </Button>

      <p className="text-xs text-navy/30 text-center">
        Our AI guide will walk you through everything next.
      </p>

      <p className="text-sm text-navy/50 text-center">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-coral hover:text-coral-dark font-medium">
          Sign in
        </Link>
      </p>
    </form>
  )
}
