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
    fullName: '',
    childName: '',
    childAge: '',
    county: '',
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
          full_name: form.fullName,
          child_name: form.childName,
          child_age: form.childAge ? parseInt(form.childAge) : null,
          county: form.county,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-navy mb-1.5">
          Your Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="Full name"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-navy mb-1.5">
            Child&apos;s Name
          </label>
          <input
            id="childName"
            type="text"
            value={form.childName}
            onChange={(e) => update('childName', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="childAge" className="block text-sm font-medium text-navy mb-1.5">
            Child&apos;s Age
          </label>
          <input
            id="childAge"
            type="number"
            min="0"
            max="40"
            value={form.childAge}
            onChange={(e) => update('childAge', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
            placeholder="Age"
          />
        </div>
      </div>

      <div>
        <label htmlFor="county" className="block text-sm font-medium text-navy mb-1.5">
          Georgia County
        </label>
        <input
          id="county"
          type="text"
          value={form.county}
          onChange={(e) => update('county', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          placeholder="e.g. Fulton, DeKalb, Gwinnett"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-sm text-navy/50 text-center">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-coral hover:text-coral-dark font-medium">
          Sign in
        </Link>
      </p>
    </form>
  )
}
