'use client'

import { useState, useEffect, useCallback } from 'react'

interface Tip {
  id: string
  parent_name: string
  county: string | null
  category: string
  title: string
  body: string
  has_contact: boolean
  created_at: string
}

const CATEGORIES = [
  'All',
  'Benefits & Waivers',
  'School & IEP',
  'Healthcare & Doctors',
  'Housing',
  'Employment & Transition',
  'Legal & Guardianship',
  'Daily Life & Coping',
  'Community Resources',
]

export default function CommunityPage() {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [connectSent, setConnectSent] = useState<Set<string>>(new Set())

  const [form, setForm] = useState({
    parent_name: '',
    county: '',
    category: 'Daily Life & Coping',
    title: '',
    body: '',
    email: '',
    phone: '',
  })

  const [connectForm, setConnectForm] = useState({ name: '', email: '', message: '' })

  const loadTips = useCallback(async () => {
    try {
      const params = category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''
      const res = await fetch(`/api/community/tips${params}`)
      if (res.ok) {
        const data = await res.json()
        setTips(data.tips || [])
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [category])

  useEffect(() => { loadTips() }, [loadTips])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/community/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
        setForm({ parent_name: '', county: '', category: 'Daily Life & Coping', title: '', body: '', email: '', phone: '' })
        loadTips()
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  const handleConnect = async (tipId: string) => {
    try {
      const res = await fetch('/api/community/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip_id: tipId, ...connectForm }),
      })
      if (res.ok) {
        setConnectSent(prev => new Set(prev).add(tipId))
        setConnectingId(null)
        setConnectForm({ name: '', email: '', message: '' })
      }
    } catch { /* ignore */ }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Parent Community</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-navy">
            Family Advice Board
          </h1>
          <p className="mt-3 text-navy/60 max-w-2xl mx-auto">
            Real advice from real Georgia families. Share what you&apos;ve learned, help another family avoid the mistakes, find the shortcuts, and know they&apos;re not alone.
          </p>
        </div>

        {/* Success banner */}
        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center justify-between">
            <span><strong>Thank you!</strong> Your tip has been posted and is helping other families.</span>
            <button onClick={() => setSubmitted(false)} className="text-green-600 hover:text-green-800 font-bold">✕</button>
          </div>
        )}

        {/* Share button + category filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  category === cat
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-navy/60 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-coral text-white rounded-lg font-medium hover:bg-coral/90 transition-colors text-sm shrink-0"
          >
            {showForm ? 'Cancel' : 'Share Your Advice'}
          </button>
        </div>

        {/* Submit form */}
        {showForm && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-lg font-bold text-navy mb-4">Share Your Advice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your First Name *</label>
                  <input
                    required
                    value={form.parent_name}
                    onChange={e => setForm(f => ({ ...f, parent_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
                    placeholder="e.g. Sarah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input
                    value={form.county}
                    onChange={e => setForm(f => ({ ...f, county: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
                    placeholder="e.g. Fulton"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
                  placeholder="e.g. How we got off the NOW waiver waitlist faster"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Advice *</label>
                <textarea
                  required
                  rows={5}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-navy focus:border-transparent outline-none resize-none"
                  placeholder="Share what you've learned — what worked, what didn't, what you wish someone had told you..."
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Want other families to be able to reach you? (Optional)
                </p>
                <p className="text-xs text-blue-600 mb-3">
                  Your contact info is <strong>never shown publicly</strong>. Other parents can request to connect, and we&apos;ll notify you so you can decide.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white"
                    placeholder="Email (private)"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white"
                    placeholder="Phone (private)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Your Advice'}
              </button>
            </form>
          </div>
        )}

        {/* Tips list */}
        {loading ? (
          <div className="text-center py-12 text-navy/40">Loading tips...</div>
        ) : tips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy mb-1">No tips yet in this category</h3>
            <p className="text-navy/50 text-sm">Be the first to share your experience and help another family.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map(tip => (
              <div key={tip.id} className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-navy/5 text-navy/60 text-xs rounded-full font-medium">
                        {tip.category}
                      </span>
                      {tip.county && (
                        <span className="text-xs text-navy/40">{tip.county} County</span>
                      )}
                      <span className="text-xs text-navy/30">{timeAgo(tip.created_at)}</span>
                    </div>
                    <h3 className="font-semibold text-navy text-base">{tip.title}</h3>
                    <p className="mt-2 text-sm text-navy/70 leading-relaxed whitespace-pre-wrap">{tip.body}</p>
                    <p className="mt-3 text-xs text-navy/40">— {tip.parent_name}</p>
                  </div>

                  {tip.has_contact && (
                    <div className="shrink-0">
                      {connectSent.has(tip.id) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => setConnectingId(connectingId === tip.id ? null : tip.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium hover:bg-blue-100 transition-colors"
                          title="Request to connect with this parent"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          Connect
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Connect form */}
                {connectingId === tip.id && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 mb-3">
                      We&apos;ll notify <strong>{tip.parent_name}</strong> that you&apos;d like to connect. They&apos;ll decide whether to share their contact info with you.
                    </p>
                    <div className="space-y-2">
                      <input
                        required
                        value={connectForm.name}
                        onChange={e => setConnectForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Your name"
                      />
                      <input
                        required
                        type="email"
                        value={connectForm.email}
                        onChange={e => setConnectForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Your email"
                      />
                      <textarea
                        rows={2}
                        value={connectForm.message}
                        onChange={e => setConnectForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                        placeholder="Brief message (optional) — e.g. 'My son is going through the same waiver process...'"
                      />
                      <button
                        onClick={() => handleConnect(tip.id)}
                        disabled={!connectForm.name || !connectForm.email}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Send Connect Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
