'use client'

import { useState } from 'react'

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent</h1>
          <p className="text-gray-600 mb-8">
            Thank you for reaching out. Our team will get back to you as soon as possible.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#2a3d66] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h1>
        <p className="text-gray-600 mb-8">
          Have a question, need help navigating benefits, or want to report an issue? We&apos;re here to help.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent outline-none transition-all text-gray-900"
              placeholder="What do you need help with?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent outline-none transition-all resize-none text-gray-900"
              placeholder="Tell us how we can help..."
            />
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full px-6 py-3 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#2a3d66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500 text-center">
          CLIFF is a free service. We never share your information with third parties.
        </p>
      </div>
    </div>
  )
}
