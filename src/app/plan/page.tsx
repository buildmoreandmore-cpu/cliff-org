'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { EASING } from '@/lib/constants'
import Link from 'next/link'

interface PlanStep {
  id: string
  step_number: number
  urgency: string
  title: string
  description: string
  phone_number: string | null
  website: string | null
  program_slug: string | null
  is_completed: boolean
  completed_at: string | null
  due_date: string | null
}

interface ActionPlan {
  id: string
  generated_at: string
  expires_at: string | null
}

interface ProfileData {
  child_name?: string
  child_dob?: string
  diagnosis?: string
  disability_track?: string
  primary_concern?: string
  county?: string
  has_medicaid?: boolean
  relationship?: string
  medically_fragile?: boolean
  parent_name?: string
}

const URGENCY_CONFIG: Record<string, { label: string; emoji: string; bg: string; border: string; text: string }> = {
  this_week: { label: 'THIS WEEK', emoji: '⚡', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  two_weeks: { label: 'NEXT 2 WEEKS', emoji: '📅', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  one_month: { label: 'THIS MONTH', emoji: '📅', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  three_months: { label: 'NEXT 3 MONTHS', emoji: '📅', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  ongoing: { label: 'ONGOING', emoji: '🔄', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
}

const URGENCY_ORDER = ['this_week', 'two_weeks', 'one_month', 'three_months', 'ongoing']

function getChildAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

function daysUntilAge(dob: string, age: number): number | null {
  const born = new Date(dob)
  const target = new Date(born)
  target.setFullYear(born.getFullYear() + age)
  const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

function isProfileComplete(p: ProfileData): boolean {
  return !!(p.child_name && p.child_dob && p.diagnosis && p.county)
}

function buildSubtitle(p: ProfileData): string {
  const parts: string[] = []

  if (p.child_name) {
    const isSelf = p.relationship === 'self'
    parts.push(isSelf ? `For ${p.child_name}` : `For ${p.child_name}'s family`)
  }

  if (p.diagnosis) {
    parts.push(p.diagnosis)
  }

  if (p.child_dob) {
    const age = getChildAge(p.child_dob)
    const d18 = daysUntilAge(p.child_dob, 18)
    const d21 = daysUntilAge(p.child_dob, 21)
    if (d18 && d18 <= 730) {
      parts.push(`age ${age} · turns 18 in ${d18} days`)
    } else if (d21 && d21 <= 730) {
      parts.push(`age ${age} · turns 21 in ${d21} days`)
    } else {
      parts.push(`age ${age}`)
    }
  }

  if (p.county) {
    parts.push(`${p.county} County, GA`)
  }

  return parts.join(' · ')
}

function buildHeadline(p: ProfileData): string {
  if (!p.child_name) return 'Your Action Plan'

  const isSelf = p.relationship === 'self'
  const name = p.child_name.split(' ')[0] // first name only

  if (p.primary_concern) {
    const concern = p.primary_concern.toLowerCase()
    if (concern.includes('18') || concern.includes('turning 18')) return `${name}'s Path Through 18`
    if (concern.includes('21') || concern.includes('turning 21')) return `${name}'s Path Through 21`
    if (concern.includes('denied')) return `${name}'s Appeal & Recovery Plan`
    if (concern.includes('lost')) return `${name}'s Benefits Recovery Plan`
    if (concern.includes('housing')) return `${name}'s Housing & Benefits Plan`
    if (concern.includes('employ')) return `${name}'s Employment & Benefits Plan`
    if (concern.includes('start') || concern.includes('where')) return `${name}'s Getting Started Plan`
  }

  if (isSelf) return `${name}'s Benefits Roadmap`
  return `${name}'s Action Plan`
}

export default function PlanPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [plan, setPlan] = useState<ActionPlan | null>(null)
  const [steps, setSteps] = useState<PlanStep[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const fetchPlan = useCallback(async () => {
    try {
      const [planRes, profileRes] = await Promise.all([
        fetch('/api/plan'),
        fetch('/api/profile'),
      ])
      const planData = await planRes.json()
      const profileData = await profileRes.json()
      setProfile(profileData)
      setPlan(planData.plan)
      setSteps(planData.steps || [])

      // Auto-generate if no plan and profile is complete enough
      if (!planData.plan && isProfileComplete(profileData)) {
        generatePlan()
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) fetchPlan()
  }, [user, userLoading, fetchPlan, router])

  async function generatePlan() {
    setGenerating(true)
    try {
      const res = await fetch('/api/plan/generate', { method: 'POST' })
      const data = await res.json()
      if (data.plan) {
        setPlan(data.plan)
        setSteps(data.steps || [])
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false)
    }
  }

  async function toggleStep(stepId: string, currentCompleted: boolean) {
    const newCompleted = !currentCompleted
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : s
      )
    )
    await fetch('/api/plan/step', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step_id: stepId, is_completed: newCompleted }),
    })
  }

  const completedCount = steps.filter((s) => s.is_completed).length
  const totalCount = steps.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const grouped = URGENCY_ORDER.map((urgency) => ({
    urgency,
    config: URGENCY_CONFIG[urgency],
    steps: steps.filter((s) => s.urgency === urgency),
  })).filter((g) => g.steps.length > 0)

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-coral border-t-transparent rounded-full" />
      </div>
    )
  }

  const profileComplete = profile && isProfileComplete(profile)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASING }}
        >
          {/* Dynamic header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy">
              {profile ? buildHeadline(profile) : 'Your Action Plan'}
            </h1>
            {profile && isProfileComplete(profile) && (
              <p className="mt-2 text-navy/50 text-sm sm:text-base">
                {buildSubtitle(profile)}
              </p>
            )}
            {profile?.medically_fragile && (
              <span className="inline-block mt-2 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg">
                Medically Fragile — Priority Programs Included
              </span>
            )}
          </div>

          {/* Profile incomplete — guide to intake */}
          {!profileComplete && !generating && (
            <div className="text-center py-16 border-2 border-dashed border-coral/30 rounded-2xl bg-coral/[0.02]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">
                Let&apos;s Build Your Plan
              </h3>
              <p className="text-navy/60 max-w-md mx-auto mb-6">
                Answer a few quick questions about your family&apos;s situation, and CLIFF will create a personalized, 
                step-by-step action plan with the exact programs, phone numbers, and deadlines for your case.
              </p>
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Start Quick Intake (3 min)
              </Link>
              <p className="mt-3 text-xs text-navy/40">
                We&apos;ll ask about diagnosis, age, county, benefits, and concerns — then build your plan automatically.
              </p>
            </div>
          )}

          {/* No plan but profile complete */}
          {profileComplete && !plan && !generating && (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-navy/60 text-lg mb-4">
                Your profile is ready. Let CLIFF build your personalized action plan.
              </p>
              <button
                onClick={generatePlan}
                className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Generate My Plan
              </button>
            </div>
          )}

          {/* Generating state */}
          {generating && (
            <div className="text-center py-16">
              <div className="animate-spin h-10 w-10 border-3 border-coral border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-navy/60 text-lg">
                Building {profile?.child_name ? `${profile.child_name.split(' ')[0]}'s` : 'your'} personalized plan...
              </p>
              <p className="text-navy/40 text-sm mt-2">
                Analyzing {profile?.diagnosis || 'your situation'} against 60+ Georgia programs
              </p>
            </div>
          )}

          {/* Plan content */}
          {plan && !generating && (
            <>
              {/* Progress bar */}
              <div className="mb-8 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-navy/60">{completedCount} of {totalCount} steps completed</span>
                  <span className="font-semibold text-navy">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {progressPercent === 100 && (
                  <p className="mt-2 text-sm text-coral font-medium text-center">
                    🎉 All steps complete! You can regenerate for updated recommendations.
                  </p>
                )}
              </div>

              {/* Context badge row */}
              <div className="flex flex-wrap gap-2 mb-6">
                {profile?.diagnosis && (
                  <span className="px-3 py-1 bg-navy/5 text-navy/70 text-xs rounded-lg font-medium">
                    {profile.diagnosis}
                  </span>
                )}
                {profile?.has_medicaid !== undefined && (
                  <span className={`px-3 py-1 text-xs rounded-lg font-medium ${
                    profile.has_medicaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    Medicaid: {profile.has_medicaid ? 'Yes' : 'No'}
                  </span>
                )}
                {profile?.disability_track && (
                  <span className="px-3 py-1 bg-navy/5 text-navy/70 text-xs rounded-lg font-medium">
                    Track: {profile.disability_track.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Grouped steps */}
              {grouped.map(({ urgency, config, steps: groupSteps }) => (
                <div key={urgency} className="mb-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.text} text-sm font-bold mb-4`}>
                    {config.emoji} {config.label}
                  </div>
                  <div className="space-y-3">
                    {groupSteps.map((step) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border ${config.border} rounded-xl p-4 sm:p-5 transition-all ${
                          step.is_completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStep(step.id, step.is_completed)}
                            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                              step.is_completed
                                ? 'bg-coral border-coral text-white'
                                : 'border-gray-300 hover:border-coral'
                            }`}
                          >
                            {step.is_completed && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-navy ${step.is_completed ? 'line-through' : ''}`}>
                              {step.title}
                            </h3>
                            <p className="mt-1 text-navy/60 text-sm leading-relaxed">
                              {step.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {step.phone_number && (
                                <a
                                  href={`tel:${step.phone_number.replace(/\D/g, '')}`}
                                  className="inline-flex items-center gap-1 text-xs bg-navy/5 hover:bg-navy/10 text-navy/70 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  📞 {step.phone_number}
                                </a>
                              )}
                              {step.website && (
                                <a
                                  href={step.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs bg-navy/5 hover:bg-navy/10 text-navy/70 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  🌐 Website
                                </a>
                              )}
                              {step.program_slug && (
                                <Link
                                  href={`/navigator?q=Help me with ${encodeURIComponent(step.title)}`}
                                  className="inline-flex items-center gap-1 text-xs bg-coral/10 hover:bg-coral/20 text-coral px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  💬 Get Help
                                </Link>
                              )}
                              {step.due_date && (
                                <span className="inline-flex items-center gap-1 text-xs text-navy/50 px-3 py-1.5">
                                  📆 Due: {new Date(step.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footer: regenerate + profile change notice */}
              <div className="text-center pt-4 pb-8 space-y-3">
                <p className="text-navy/40 text-sm">
                  Plan generated {new Date(plan.generated_at).toLocaleDateString()} based on your profile
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={generatePlan}
                    className="text-coral hover:text-coral/80 font-medium text-sm transition-colors"
                  >
                    🔄 Regenerate Plan
                  </button>
                  <Link
                    href="/intake"
                    className="text-navy/50 hover:text-navy/70 font-medium text-sm transition-colors"
                  >
                    ✏️ Update My Info
                  </Link>
                </div>
                <p className="text-navy/30 text-xs max-w-md mx-auto">
                  Update your profile info anytime — your plan will regenerate with new recommendations based on what changed.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
