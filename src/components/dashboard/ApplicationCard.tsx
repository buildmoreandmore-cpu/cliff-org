'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { Application, ApplicationStatus, Profile } from '@/lib/types'
import { ClipboardIcon, CheckIcon, ArrowRightIcon, AlertIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'


interface ApplicationCardProps {
  applications: Application[]
  profile: Profile | null
  onUpdate: () => void
  onStartApplication: (programName: string) => void
}

interface ProgramDef {
  name: string
  key: string
}

const GA_PROGRAMS: ProgramDef[] = [
  { name: 'SSI (Supplemental Security Income)', key: 'ssi' },
  { name: 'Georgia Medicaid', key: 'medicaid' },
  { name: 'Katie Beckett / Deeming Waiver', key: 'katie_beckett' },
  { name: 'NOW Waiver (Planning List)', key: 'now_waiver' },
  { name: 'COMP Waiver (Planning List)', key: 'comp_waiver' },
  { name: 'EPSDT', key: 'epsdt' },
  { name: 'GAPP', key: 'gapp' },
  { name: 'Vocational Rehabilitation', key: 'vr' },
  { name: 'ABLE Account', key: 'able' },
  { name: 'Guardianship / POA', key: 'guardianship' },
]

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

function getRecommended(key: string, childDob: string | null): boolean {
  const age = getChildAge(childDob)
  if (age === null) return false
  const mo18 = getMonthsUntilAge(childDob, 18) ?? 999
  const mo21 = getMonthsUntilAge(childDob, 21) ?? 999

  if (age < 18) {
    if (['ssi', 'medicaid', 'katie_beckett', 'now_waiver', 'comp_waiver', 'epsdt'].includes(key)) return true
  }
  // Turning 18 (within 24 months)
  if (mo18 > 0 && mo18 <= 24) {
    if (['ssi', 'guardianship'].includes(key)) return true
  }
  if (age >= 18) {
    if (['vr', 'able', 'medicaid'].includes(key)) return true
  }
  // Turning 21 (within 24 months)
  if (mo21 > 0 && mo21 <= 24) {
    if (['now_waiver', 'comp_waiver'].includes(key)) return true
  }
  return false
}

export default function ApplicationCard({ applications, profile, onUpdate, onStartApplication }: ApplicationCardProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
  const isRecommended = (prog: ProgramDef) => getRecommended(prog.key, profile?.child_dob ?? null)

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6 lg:col-span-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ClipboardIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Georgia Programs Checklist</h2>
      </div>

      <div className="space-y-1">
        {GA_PROGRAMS.map((prog) => {
          const app = matchApp(prog)
          const recommended = isRecommended(prog)
          const expanded = expandedKey === prog.key

          return (
            <div key={prog.key} className="border border-gray-50 rounded-lg">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream/40 transition-colors"
                onClick={() => setExpandedKey(expanded ? null : prog.key)}
              >
                {/* Checkbox */}
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  app && app.status !== 'not_started'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300'
                }`}>
                  {app && app.status !== 'not_started' && <CheckIcon size={12} />}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-navy">{prog.name}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {recommended && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral/10 text-coral">
                      Recommended
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
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50">
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
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-navy/40">No application started yet.</p>
                          <button
                            onClick={() => onStartApplication(prog.name)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-coral hover:text-coral-dark transition-colors"
                          >
                            Start Application <ArrowRightIcon size={12} />
                          </button>
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
  )
}
