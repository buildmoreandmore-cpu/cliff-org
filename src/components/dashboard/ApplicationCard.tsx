'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { Application, ApplicationStatus, Profile } from '@/lib/types'
import { ClipboardIcon, CheckIcon, ArrowRightIcon, AlertIcon, ExternalLinkIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'
import { getApplicationLink } from '@/data/application-links'


interface ApplicationCardProps {
  applications: Application[]
  profile: Profile | null
  onUpdate: () => void
  onStartApplication: (programName: string) => void
}

interface ProgramDef {
  name: string
  key: string
  category: string
}

const GA_PROGRAMS: ProgramDef[] = [
  // Income & Insurance
  { name: 'SSI (Supplemental Security Income)', key: 'ssi', category: 'Income & Insurance' },
  { name: 'SSDI / DAC Benefits', key: 'ssdi_dac', category: 'Income & Insurance' },
  { name: 'Georgia Medicaid', key: 'medicaid', category: 'Income & Insurance' },
  { name: 'PeachCare for Kids', key: 'peachcare', category: 'Income & Insurance' },
  { name: 'Medicaid for Workers with Disabilities', key: 'medicaid_buy_in', category: 'Income & Insurance' },
  // Waivers & Services
  { name: 'Katie Beckett / Deeming Waiver', key: 'katie_beckett', category: 'Waivers & Services' },
  { name: 'NOW Waiver (Planning List)', key: 'now_waiver', category: 'Waivers & Services' },
  { name: 'COMP Waiver (Planning List)', key: 'comp_waiver', category: 'Waivers & Services' },
  { name: 'ICWP (Physical/TBI Waiver)', key: 'icwp', category: 'Waivers & Services' },
  { name: 'SOURCE / CCSP (EDWP)', key: 'source_ccsp', category: 'Waivers & Services' },
  { name: 'EPSDT (Under 21)', key: 'epsdt', category: 'Waivers & Services' },
  { name: 'GAPP (Pediatric Nursing)', key: 'gapp', category: 'Waivers & Services' },
  // Financial Planning
  { name: 'ABLE Account (GA STABLE)', key: 'able', category: 'Financial Planning' },
  { name: 'Special Needs Trust', key: 'snt', category: 'Financial Planning' },
  { name: 'SNAP (Food Benefits)', key: 'snap', category: 'Financial Planning' },
  // Housing
  { name: 'Section 8 / Housing Vouchers', key: 'section8', category: 'Housing' },
  // Employment & Transition
  { name: 'Vocational Rehabilitation (GVRA)', key: 'vr', category: 'Employment & Transition' },
  { name: 'Pre-ETS (Students 14-22)', key: 'pre_ets', category: 'Employment & Transition' },
  { name: 'Ticket to Work', key: 'ticket_to_work', category: 'Employment & Transition' },
  // Legal & Planning
  { name: 'Guardianship / POA', key: 'guardianship', category: 'Legal & Planning' },
]

const CATEGORIES = [...new Set(GA_PROGRAMS.map((p) => p.category))]

const STATUS_OPTIONS: ApplicationStatus[] = [
  'not_started', 'in_progress', 'submitted', 'under_review', 'approved', 'denied', 'appealing',
]

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-purple-100 text-purple-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  appealing: 'bg-orange-100 text-orange-700',
}

function getChildAge(dob: string | null): number | null {
  if (!dob) return null
  const born = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) age--
  return age
}

function getMonthsUntilAge(dob: string | null, targetAge: number): number | null {
  if (!dob) return null
  const born = new Date(dob)
  const target = new Date(born.getFullYear() + targetAge, born.getMonth(), born.getDate())
  const now = new Date()
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
}

// 2025/2026 Federal Poverty Level thresholds
const FPL_100: Record<number, number> = {
  1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960,
}
function getFPL(householdSize: number, percent: number): number {
  const size = Math.min(householdSize, 6)
  const extra = Math.max(0, householdSize - 6) * 5380
  return ((FPL_100[size] || FPL_100[4]) + extra) * (percent / 100)
}

// Map income range string to a midpoint dollar amount for comparison
function incomeToMidpoint(income: string): number {
  switch (income) {
    case 'under_25k': return 12500
    case '25k_50k': return 37500
    case '50k_75k': return 62500
    case '75k_100k': return 87500
    case 'over_100k': return 125000
    default: return 50000
  }
}

type EligibilityTag = 'likely_eligible' | 'may_not_qualify' | null

function getIncomeEligibility(
  key: string,
  householdIncome: string | null,
  householdSize: number | null,
): EligibilityTag {
  if (!householdIncome) return null
  const size = householdSize || 4
  const income = incomeToMidpoint(householdIncome)

  switch (key) {
    case 'peachcare':
      // 247% FPL
      return income <= getFPL(size, 247) ? 'likely_eligible' : 'may_not_qualify'
    case 'snap':
      // ~130% FPL gross income
      return income <= getFPL(size, 130) ? 'likely_eligible' : 'may_not_qualify'
    case 'section8':
      // ~50% AMI — simplified: likely eligible for under_25k and 25k_50k
      return ['under_25k', '25k_50k'].includes(householdIncome) ? 'likely_eligible' : 'may_not_qualify'
    case 'ssi':
      // ~$943/mo individual — simplified: eligible if under_25k
      return householdIncome === 'under_25k' ? 'likely_eligible' : 'may_not_qualify'
    case 'medicaid':
      // ~138% FPL
      return income <= getFPL(size, 138) ? 'likely_eligible' : 'may_not_qualify'
    case 'medicaid_buy_in':
      // Higher limits for workers with disabilities — generally eligible if under 250% FPL
      return income <= getFPL(size, 250) ? 'likely_eligible' : 'may_not_qualify'
    default:
      return null
  }
}

function getRecommended(key: string, profile: Profile | null): boolean {
  const childDob = profile?.child_dob ?? null
  const age = getChildAge(childDob)
  if (age === null) return false
  const mo18 = getMonthsUntilAge(childDob, 18) ?? 999
  const mo21 = getMonthsUntilAge(childDob, 21) ?? 999

  // Citizenship gate — SSI, Medicaid, SNAP, Section 8 require citizen/permanent_resident
  const citizenshipGated = ['ssi', 'medicaid', 'snap', 'section8', 'peachcare']
  if (citizenshipGated.includes(key) && profile?.citizenship_status === 'other') return false

  // Living situation gate — community waivers don't apply in nursing facilities
  const communityOnly = ['now_waiver', 'comp_waiver', 'icwp', 'source_ccsp']
  if (communityOnly.includes(key) && profile?.living_situation === 'nursing_facility') return false

  // Already on waitlist — don't recommend re-applying, they're already in queue
  if (profile?.waiver_waitlist) {
    if (key === 'now_waiver' && ['now', 'both'].includes(profile.waiver_waitlist)) return false
    if (key === 'comp_waiver' && ['comp', 'both'].includes(profile.waiver_waitlist)) return false
  }

  // Always recommended regardless of age
  if (['able', 'snt', 'section8', 'snap'].includes(key)) return true

  // Child under 18
  if (age < 18) {
    if (['ssi', 'medicaid', 'katie_beckett', 'now_waiver', 'comp_waiver', 'epsdt', 'gapp'].includes(key)) return true
    if (age < 19 && key === 'peachcare') return true
  }
  // Student 14-22
  if (age >= 14 && age <= 22) {
    if (['pre_ets', 'vr'].includes(key)) return true
  }
  // Turning 18 (within 24 months)
  if (mo18 > 0 && mo18 <= 24) {
    if (['ssi', 'guardianship', 'ssdi_dac'].includes(key)) return true
  }
  // 18+
  if (age >= 18) {
    if (['vr', 'medicaid', 'medicaid_buy_in', 'ticket_to_work', 'ssdi_dac'].includes(key)) return true
  }
  // 21+ physical/TBI
  if (age >= 21) {
    if (['icwp', 'source_ccsp'].includes(key)) return true
  }
  // Turning 21 (within 24 months) — EPSDT/GAPP ending
  if (mo21 > 0 && mo21 <= 24) {
    if (['now_waiver', 'comp_waiver', 'icwp', 'source_ccsp'].includes(key)) return true
  }

  // Employment-specific programs — only recommend if employed or seeking work
  if (key === 'ticket_to_work' && profile?.employment_status === 'not_working') return false
  if (key === 'medicaid_buy_in' && profile?.employment_status === 'not_working') return false

  return false
}

export default function ApplicationCard({ applications, profile, onUpdate, onStartApplication }: ApplicationCardProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function findApp(programName: string): Application | undefined {
    return applications.find((a) => a.program_name.toLowerCase().includes(programName.toLowerCase()) ||
      programName.toLowerCase().includes(a.program_name.toLowerCase()))
  }

  // Build a mapping: try matching each GA program to an existing application
  function matchApp(prog: ProgramDef): Application | undefined {
    const lower = prog.name.toLowerCase()
    return applications.find((a) => {
      const aLower = a.program_name.toLowerCase()
      return aLower === lower || aLower.includes(prog.key.replace('_', ' ')) || lower.includes(aLower)
    })
  }

  async function updateStatus(appId: string, newStatus: ApplicationStatus) {
    setUpdatingId(appId)
    const supabase = createClient()
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)
    setUpdatingId(null)
    onUpdate()
  }

  const hasApp = (prog: ProgramDef) => !!matchApp(prog)
  const isRecommended = (prog: ProgramDef) => getRecommended(prog.key, profile)
  const getEligibility = (prog: ProgramDef) => getIncomeEligibility(prog.key, profile?.household_income ?? null, profile?.household_size ?? null)

  // Programs that require active Medicaid as a prerequisite
  const MEDICAID_REQUIRED_PROGRAMS = ['now_waiver', 'comp_waiver', 'icwp', 'source_ccsp', 'epsdt', 'gapp']
  const needsMedicaid = (prog: ProgramDef) =>
    profile?.has_medicaid === false && MEDICAID_REQUIRED_PROGRAMS.includes(prog.key)

  // Check if already on waitlist for this program
  const onWaitlist = (prog: ProgramDef) => {
    if (!profile?.waiver_waitlist || profile.waiver_waitlist === 'none') return false
    if (prog.key === 'now_waiver' && ['now', 'both'].includes(profile.waiver_waitlist)) return true
    if (prog.key === 'comp_waiver' && ['comp', 'both'].includes(profile.waiver_waitlist)) return true
    return false
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 lg:col-span-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ClipboardIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Georgia Programs Checklist</h2>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const programs = GA_PROGRAMS.filter((p) => p.category === category)
          const isCollapsed = collapsedCategories.has(category)
          const activeCount = programs.filter((p) => {
            const a = matchApp(p)
            return a && a.status !== 'not_started'
          }).length
          const recommendedCount = programs.filter((p) => isRecommended(p)).length

          return (
            <div key={category}>
              <button
                className="w-full flex items-center gap-2 px-1 py-1.5 text-left group"
                onClick={() => toggleCategory(category)}
              >
                <ArrowRightIcon
                  size={12}
                  className={`text-navy/30 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                />
                <span className="text-xs font-semibold text-navy/50 uppercase tracking-wider">{category}</span>
                <span className="text-[10px] text-navy/30">
                  {activeCount > 0 && `${activeCount} active`}
                  {activeCount > 0 && recommendedCount > 0 && ' · '}
                  {recommendedCount > 0 && `${recommendedCount} recommended`}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1">
                      {programs.map((prog) => {
                        const app = matchApp(prog)
                        const recommended = isRecommended(prog)
                        const eligibility = getEligibility(prog)
                        const expanded = expandedKey === prog.key

                        return (
                          <div key={prog.key} className="border border-gray-50 rounded-lg">
                            <button
                              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-cream/40 transition-colors"
                              onClick={() => setExpandedKey(expanded ? null : prog.key)}
                            >
                              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                app && app.status !== 'not_started'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300'
                              }`}>
                                {app && app.status !== 'not_started' && <CheckIcon size={12} />}
                              </span>

                              <span className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium text-navy line-clamp-1">{prog.name}</span>
                              </span>

                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
                                {recommended && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral/10 text-coral">
                                    Recommended
                                  </span>
                                )}
                                {eligibility === 'likely_eligible' && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    Likely Eligible
                                  </span>
                                )}
                                {eligibility === 'may_not_qualify' && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                    May Not Qualify
                                  </span>
                                )}
                                {needsMedicaid(prog) && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    Needs Medicaid
                                  </span>
                                )}
                                {onWaitlist(prog) && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    On Waitlist
                                  </span>
                                )}
                                {app && (
                                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[app.status]}`}>
                                    {app.status.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                            </button>

                            <AnimatePresence>
                              {expanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-gray-50">
                                    {app ? (
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-xs text-navy/60">
                                          {app.application_date && <p>Applied: {new Date(app.application_date).toLocaleDateString()}</p>}
                                          {app.case_number && <p>Case #: {app.case_number}</p>}
                                          {app.coordinator_name && <p>Coordinator: {app.coordinator_name}</p>}
                                          {app.coordinator_phone && (
                                            <p>Phone: <a href={`tel:${app.coordinator_phone}`} className="text-coral hover:underline">{app.coordinator_phone}</a></p>
                                          )}
                                          {app.coordinator_email && (
                                            <p>Email: <a href={`mailto:${app.coordinator_email}`} className="text-coral hover:underline">{app.coordinator_email}</a></p>
                                          )}
                                        </div>
                                        {app.denial_reason && (
                                          <div className="flex items-start gap-1.5 text-xs text-red-600">
                                            <AlertIcon size={12} className="mt-0.5 shrink-0" />
                                            <span>Denied: {app.denial_reason}</span>
                                          </div>
                                        )}
                                        {app.appeal_deadline && (
                                          <p className="text-xs text-coral font-medium">
                                            Appeal deadline: {new Date(app.appeal_deadline).toLocaleDateString()}
                                          </p>
                                        )}
                                        {app.notes && <p className="text-xs text-navy/50">{app.notes}</p>}

                                        <div className="flex items-center gap-3 pt-1">
                                          <label className="text-xs text-navy/50">Status:</label>
                                          <select
                                            value={app.status}
                                            onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                                            disabled={updatingId === app.id}
                                            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-navy bg-white"
                                          >
                                            {STATUS_OPTIONS.map((s) => (
                                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-xs text-navy/40">No application started yet.</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                          {(() => {
                                            const appLink = getApplicationLink(prog.name)
                                            if (appLink) {
                                              return (
                                                <a
                                                  href={appLink.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-coral hover:bg-coral/90 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                  <ExternalLinkIcon size={12} />
                                                  {appLink.label}
                                                </a>
                                              )
                                            }
                                            return null
                                          })()}
                                          <button
                                            onClick={() => onStartApplication(prog.name)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:text-coral-dark transition-colors"
                                          >
                                            Need help applying? <ArrowRightIcon size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
