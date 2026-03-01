'use client'

import { useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

interface FlagModalProps {
  contentBlockSlug?: string
  onClose: () => void
}

const HEARD_FROM_OPTIONS = [
  'Caseworker',
  'Parent group',
  'Doctor',
  'Attorney',
  'School',
  'Other',
]

export default function FlagModal({ contentBlockSlug, onClose }: FlagModalProps) {
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)

    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: 'correction',
          description: description.trim(),
          source_heard_from: source || null,
          submitter_email: email || null,
          related_content_block: contentBlockSlug || null,
          submitted_by: user?.id || null,
        }),
      })
      setDone(true)
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 className="font-display text-lg font-bold text-navy mb-2">Thank you!</h3>
          <p className="text-sm text-navy/60">Your feedback helps CLIFF stay accurate for every Georgia family.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 text-sm text-coral hover:text-coral-dark transition-colors">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-navy mb-1">Flag this page</h3>
        <p className="text-sm text-navy/50 mb-4">Help us keep CLIFF accurate and complete.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">What did you find that we don&apos;t cover?</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-none"
              placeholder="A program, contact, or detail that's missing or outdated..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">Where did you hear about it?</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral bg-white"
            >
              <option value="">Select...</option>
              {HEARD_FROM_OPTIONS.map(opt => (
                <option key={opt} value={opt.toLowerCase()}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">Can we contact you if we have questions? <span className="text-navy/30">(optional)</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-navy/60 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting || !description.trim()} className="flex-1 px-4 py-2.5 text-sm text-white bg-coral rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-40">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
