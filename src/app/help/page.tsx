'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { SendIcon, CheckIcon } from '@/components/ui/SVGIcons'

export default function HelpPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }

      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING }}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Help & Support</h1>
          <p className="text-navy/50 text-sm sm:text-base mt-2 mb-8">
            Have a question, issue, or suggestion? Send us a message and our team will get back to you.
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASING }}
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckIcon size={28} className="text-green-600" />
            </div>
            <h2 className="font-display text-xl font-semibold text-navy mb-2">Message Sent</h2>
            <p className="text-navy/50 text-sm mb-6">
              Thank you for reaching out. We&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm font-medium text-coral hover:text-coral-dark transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-navy/60 mb-1.5 block">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-navy/60 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-navy/60 mb-1.5 block">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="What can we help with?"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-navy/60 mb-1.5 block">Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Describe your question or issue..."
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending || !form.name.trim() || !form.email.trim() || !form.message.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-coral text-white font-medium rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon size={16} />
                  Send Message
                </>
              )}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  )
}
