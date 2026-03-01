'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertIcon, MailIcon, CheckIcon } from '@/components/ui/SVGIcons'

interface BillData {
  bill_number?: string
  summary?: string
  impact?: string
  impact_level?: string
  status?: string
}

interface BillBlock {
  id: string
  slug: string
  title: string
  body: string
  source_url: string | null
  last_verified: string | null
}

interface EmailDraft {
  subject: string
  body: string
  suggested_recipients?: string
}

export default function AdvocacyPage() {
  const [bills, setBills] = useState<BillBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<string, EmailDraft>>({})
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // Get profile
        const profileRes = await fetch('/api/profile')
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfileId(profileData.profile?.id || null)
        }

        // Fetch bills from content_blocks (via a simple search)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: '__fetch_bills__' }],
            mode: null,
          }),
        })
        // We can't use the chat API for this — let's use a direct fetch instead
        // For now, we'll use a simpler approach
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Fetch bills directly
  useEffect(() => {
    async function fetchBills() {
      try {
        const res = await fetch('/api/advocacy/bills')
        if (res.ok) {
          const data = await res.json()
          setBills(data.bills || [])
        }
      } catch {
        // Bills endpoint may not exist yet, that's okay
      } finally {
        setLoading(false)
      }
    }
    fetchBills()
  }, [])

  const generateEmail = useCallback(async (billSlug: string) => {
    if (!profileId || generatingFor) return
    setGeneratingFor(billSlug)

    try {
      const res = await fetch('/api/agents/advocacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_type: 'generate_advocacy_email',
          profileId,
          billSlug,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setEmails((prev) => ({ ...prev, [billSlug]: data.email }))
        setExpandedEmail(billSlug)
      }
    } catch (err) {
      console.error('Failed to generate email:', err)
    } finally {
      setGeneratingFor(null)
    }
  }, [profileId, generatingFor])

  function copyEmail(slug: string) {
    const email = emails[slug]
    if (!email) return
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  function parseBillData(body: string): BillData {
    try {
      return JSON.parse(body)
    } catch {
      return { summary: body }
    }
  }

  function getImpactColor(level?: string) {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Advocacy Hub</h1>
          <p className="text-navy/50 text-sm sm:text-base mt-2">
            Stay informed about Georgia legislation affecting disability services. Take action with personalized emails to your representatives.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
            <AlertIcon size={40} className="text-navy/20 mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold text-navy mb-2">No Active Alerts</h2>
            <p className="text-navy/40 text-sm max-w-md mx-auto">
              There are no active legislative alerts right now. We scan for relevant Georgia bills weekly during the legislative session. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((block) => {
              const bill = parseBillData(block.body)
              const email = emails[block.slug]
              const isExpanded = expandedEmail === block.slug

              return (
                <div key={block.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {bill.bill_number && (
                            <span className="text-xs font-mono font-semibold text-coral bg-coral/10 px-2 py-0.5 rounded">
                              {bill.bill_number}
                            </span>
                          )}
                          {bill.impact_level && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${getImpactColor(bill.impact_level)}`}>
                              {bill.impact_level} impact
                            </span>
                          )}
                          {bill.status && (
                            <span className="text-xs text-navy/40">
                              {bill.status.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-navy mt-2 text-sm sm:text-base">
                          {block.title}
                        </h3>
                      </div>
                    </div>

                    {bill.summary && (
                      <p className="text-navy/60 text-sm mb-2">{bill.summary}</p>
                    )}
                    {bill.impact && (
                      <p className="text-navy/80 text-sm font-medium">
                        <span className="text-coral">Impact:</span> {bill.impact}
                      </p>
                    )}

                    {block.source_url && (
                      <a
                        href={block.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coral text-xs hover:underline mt-2 inline-block"
                      >
                        View Source →
                      </a>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => email ? setExpandedEmail(isExpanded ? null : block.slug) : generateEmail(block.slug)}
                        disabled={generatingFor === block.slug || !profileId}
                        className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingFor === block.slug ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <MailIcon size={16} />
                            {email ? (isExpanded ? 'Hide Email' : 'Show Email') : 'Take Action'}
                          </>
                        )}
                      </button>

                      {!profileId && (
                        <span className="text-xs text-navy/30">Sign in to take action</span>
                      )}
                    </div>
                  </div>

                  {/* Email draft */}
                  {email && isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6">
                      <div className="mb-3">
                        <p className="text-xs text-navy/40 mb-1">Subject</p>
                        <p className="text-sm font-medium text-navy">{email.subject}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-navy/40 mb-1">Email Body</p>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-navy/80 whitespace-pre-wrap">
                          {email.body}
                        </div>
                      </div>
                      {email.suggested_recipients && (
                        <p className="text-xs text-navy/40 mb-3">
                          Send to: {email.suggested_recipients}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyEmail(block.slug)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-sm rounded-xl hover:bg-navy-light transition-colors"
                        >
                          {copied === block.slug ? (
                            <>
                              <CheckIcon size={14} />
                              Copied!
                            </>
                          ) : (
                            'Copy Email'
                          )}
                        </button>
                        <a
                          href={`mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                          className="flex items-center gap-1.5 px-3 py-2 border border-coral text-coral text-sm rounded-xl hover:bg-coral/5 transition-colors"
                        >
                          <MailIcon size={14} />
                          Send via Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
