'use client'

import { useState } from 'react'
import Link from 'next/link'

const ROLE_OPTIONS = [
  'Case Manager',
  'Disability Attorney',
  'Social Worker',
  'Advocate',
  'Educator',
  'Healthcare Provider',
  'Other',
]

const COVERAGE_OPTIONS = ['Statewide', 'Specific counties']

export default function SuggestPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    org: '',
    role: '',
    programName: '',
    whoItServes: '',
    coverage: '',
    counties: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    description: '',
  })

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || !form.programName.trim()) return
    setSubmitting(true)

    try {
      await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: 'program',
          submitter_role: form.role.toLowerCase().replace(/ /g, '_'),
          submitter_org: form.org || null,
          program_name: form.programName,
          description: form.description,
          who_it_serves: form.whoItServes || null,
          geographic_coverage: form.coverage || null,
          counties_served: form.counties ? form.counties.split(',').map(c => c.trim()) : null,
          contact_name: form.contactName || null,
          contact_email: form.contactEmail || null,
          contact_phone: form.contactPhone || null,
          website_url: form.website || null,
        }),
      })
      setSubmitted(true)
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-navy mb-3">Submission received</h1>
          <p className="text-navy/60 mb-6">Thank you for helping keep CLIFF accurate and complete. Our team will review your submission and add verified resources to our library.</p>
          <Link href="/" className="text-coral hover:text-coral-dark transition-colors text-sm font-medium">← Back to CLIFF</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="text-sm text-navy/40 hover:text-coral transition-colors mb-6 inline-block">← Back to CLIFF</Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2">Suggest a Resource</h1>
          <p className="text-navy/60">Are you a professional working with Georgia families of individuals with disabilities? Help us keep CLIFF accurate and complete.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1">Organization name</label>
              <input
                type="text"
                value={form.org}
                onChange={e => update('org', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                placeholder="Your organization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1">Your role</label>
              <select
                value={form.role}
                onChange={e => update('role', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-white"
              >
                <option value="">Select role...</option>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">Program or resource name <span className="text-coral">*</span></label>
            <input
              type="text"
              value={form.programName}
              onChange={e => update('programName', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              placeholder="e.g., SOURCE Medicaid Waiver"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">Who does it serve?</label>
            <input
              type="text"
              value={form.whoItServes}
              onChange={e => update('whoItServes', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              placeholder="e.g., Children with physical disabilities under 21"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1">Geographic coverage</label>
              <select
                value={form.coverage}
                onChange={e => update('coverage', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-white"
              >
                <option value="">Select...</option>
                {COVERAGE_OPTIONS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            {form.coverage === 'specific counties' && (
              <div>
                <label className="block text-sm font-medium text-navy/70 mb-1">Counties</label>
                <input
                  type="text"
                  value={form.counties}
                  onChange={e => update('counties', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                  placeholder="Fulton, DeKalb, Gwinnett..."
                />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-navy/70 mb-3">Contact information for the program</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => update('contactName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                  placeholder="Contact name"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={e => update('contactEmail', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                  placeholder="Contact email"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={e => update('contactPhone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => update('website', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                  placeholder="Website or official source URL"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">Why families need to know about this <span className="text-coral">*</span></label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-none"
              placeholder="What does this program do? Why is it important? What do families typically miss about it?"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !form.description.trim() || !form.programName.trim()}
            className="w-full py-3 text-sm font-medium text-white bg-coral rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-40"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
