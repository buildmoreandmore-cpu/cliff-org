'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Submission {
  id: string
  submission_type: string
  program_name: string | null
  description: string
  submitter_email: string | null
  submitter_role: string | null
  submitter_org: string | null
  source_heard_from: string | null
  geographic_coverage: string | null
  counties_served: string[] | null
  who_it_serves: string | null
  contact_name: string | null
  contact_email: string | null
  website_url: string | null
  related_content_block: string | null
  navigator_session_id: string | null
  status: string
  priority: string
  research_notes: string | null
  rejection_reason: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  researching: 'bg-blue-50 text-blue-700 border-blue-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  added: 'bg-sage/20 text-sage border-sage/30',
  duplicate: 'bg-gray-50 text-gray-500 border-gray-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const STATUS_TABS = ['pending', 'researching', 'verified', 'added', 'rejected', 'all']

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [researchingId, setResearchingId] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [authed, setAuthed] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/community/submissions?status=${activeTab}`, {
        headers: { 'x-api-key': apiKey },
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch { /* */ }
    setLoading(false)
  }, [activeTab, apiKey])

  useEffect(() => {
    if (authed) fetchSubmissions()
  }, [authed, fetchSubmissions])

  async function updateStatus(id: string, status: string, extra?: Record<string, string>) {
    await fetch('/api/community/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ id, status, ...extra }),
    })
    fetchSubmissions()
  }

  async function researchSubmission(sub: Submission) {
    setResearchingId(sub.id)
    try {
      const res = await fetch('/api/agents/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ query: `${sub.program_name || ''} ${sub.description} Georgia disability benefits program` }),
      })
      const data = await res.json()
      const notes = data.synthesis || data.answer || JSON.stringify(data)
      await updateStatus(sub.id, 'researching', { research_notes: notes })
    } catch {
      await updateStatus(sub.id, 'researching', { research_notes: 'Research failed — try manually.' })
    }
    setResearchingId(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <h1 className="font-display text-xl font-bold text-navy mb-4">Admin Access</h1>
          <form onSubmit={e => { e.preventDefault(); setAuthed(true) }}>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="API Key"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-navy mb-3 focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            <button type="submit" className="w-full py-2.5 bg-coral text-white text-sm rounded-xl hover:bg-coral-dark transition-colors">Enter</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-navy/40 hover:text-coral transition-colors">← Admin</Link>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-navy mt-1">Community Submissions</h1>
          </div>
          <span className="text-sm text-navy/40">{submissions.length} {activeTab === 'all' ? 'total' : activeTab}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-navy text-white' : 'bg-white text-navy/50 hover:text-navy border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-navy/40 text-sm">No {activeTab} submissions</div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                      {sub.status}
                    </span>
                    <span className="text-xs text-navy/40 capitalize">{sub.submission_type}</span>
                    {sub.submitter_role && <span className="text-xs text-navy/30">• {sub.submitter_role.replace(/_/g, ' ')}</span>}
                    {sub.navigator_session_id && <span className="text-xs text-blue-400">• via Navigator</span>}
                  </div>
                  <span className="text-xs text-navy/30 whitespace-nowrap">{new Date(sub.created_at).toLocaleDateString()}</span>
                </div>

                {/* Program name */}
                {sub.program_name && (
                  <h3 className="font-medium text-navy text-sm mb-1">{sub.program_name}</h3>
                )}

                {/* Description */}
                <p className="text-sm text-navy/70 mb-3 whitespace-pre-wrap">{sub.description}</p>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/40 mb-3">
                  {sub.source_heard_from && <span>Heard from: {sub.source_heard_from}</span>}
                  {sub.geographic_coverage && <span>Coverage: {sub.geographic_coverage}</span>}
                  {sub.counties_served?.length && <span>Counties: {sub.counties_served.join(', ')}</span>}
                  {sub.submitter_org && <span>Org: {sub.submitter_org}</span>}
                  {sub.submitter_email && <span>Email: {sub.submitter_email}</span>}
                  {sub.website_url && <a href={sub.website_url} target="_blank" rel="noopener" className="text-coral hover:underline">Website ↗</a>}
                  {sub.related_content_block && <span>Page: {sub.related_content_block}</span>}
                </div>

                {/* Research notes */}
                {sub.research_notes && (
                  <div className="bg-blue-50/50 rounded-lg p-3 mb-3 border border-blue-100">
                    <p className="text-xs font-medium text-blue-700 mb-1">Research Notes</p>
                    <p className="text-xs text-blue-600/80 whitespace-pre-wrap">{sub.research_notes}</p>
                  </div>
                )}

                {/* Actions */}
                {sub.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => researchSubmission(sub)}
                      disabled={researchingId === sub.id}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40"
                    >
                      {researchingId === sub.id ? 'Researching...' : 'Research It'}
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'added')}
                      className="px-3 py-1.5 text-xs font-medium text-sage bg-sage/10 rounded-lg hover:bg-sage/20 transition-colors"
                    >
                      Add to Resources
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'duplicate')}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason?')
                        if (reason) updateStatus(sub.id, 'rejected', { rejection_reason: reason })
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {sub.status === 'researching' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => updateStatus(sub.id, 'verified')}
                      className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateStatus(sub.id, 'added')}
                      className="px-3 py-1.5 text-xs font-medium text-sage bg-sage/10 rounded-lg hover:bg-sage/20 transition-colors"
                    >
                      Add to Resources
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason?')
                        if (reason) updateStatus(sub.id, 'rejected', { rejection_reason: reason })
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {sub.status === 'verified' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => updateStatus(sub.id, 'added')}
                      className="px-3 py-1.5 text-xs font-medium text-sage bg-sage/10 rounded-lg hover:bg-sage/20 transition-colors"
                    >
                      Add to Resources
                    </button>
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
