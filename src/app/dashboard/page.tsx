'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { EASING } from '@/lib/constants'
import QuickActions from '@/components/dashboard/QuickActions'
import BenefitTracker from '@/components/dashboard/BenefitTracker'
import ApplicationCard from '@/components/dashboard/ApplicationCard'
import ReminderList from '@/components/dashboard/ReminderList'
import DocumentList from '@/components/dashboard/DocumentList'
import ContactsManager from '@/components/dashboard/ContactsManager'
import NotificationInbox from '@/components/dashboard/NotificationInbox'
import NavigatorDrawer from '@/components/dashboard/NavigatorDrawer'
import FeatureGuideCard from '@/components/dashboard/FeatureGuideCard'
import { HeartIcon, XIcon } from '@/components/ui/SVGIcons'
import type { ChildBenefit, Application, Reminder, SavedDocument, Profile, Notification } from '@/lib/types'

function calcAge(dob: string | null): string {
  if (!dob) return ''
  const born = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - born.getFullYear()
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) years--
  return `${years} years old`
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: userLoading, error: userError } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [benefits, setBenefits] = useState<ChildBenefit[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<Partial<Profile>>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [drawerProgram, setDrawerProgram] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cliff_guide_dismissed')) setShowGuide(true)
  }, [])

  function dismissGuide() {
    localStorage.setItem('cliff_guide_dismissed', '1')
    setShowGuide(false)
  }

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const supabase = createClient()

      const profileRes = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      const prof = profileRes.data as Profile | null
      if (prof && !prof.child_name) {
        router.push('/intake')
        return
      }
      setProfile(prof)

      if (prof) {
        const [benefitsRes, appsRes, remindersRes, docsRes, notifsRes] = await Promise.all([
          supabase.from('child_benefits').select('*').eq('profile_id', prof.id),
          supabase.from('applications').select('*').eq('profile_id', prof.id),
          supabase.from('reminders').select('*').eq('profile_id', prof.id).order('due_date'),
          supabase.from('saved_documents').select('*').eq('profile_id', prof.id).order('id', { ascending: false }),
          supabase.from('notifications').select('*').eq('profile_id', prof.id).order('created_at', { ascending: false }).limit(20),
        ])

        setBenefits((benefitsRes.data || []) as ChildBenefit[])
        setApplications((appsRes.data || []) as Application[])
        setReminders((remindersRes.data || []) as Reminder[])
        setDocuments((docsRes.data || []) as SavedDocument[])
        setNotifications((notifsRes.data || []) as Notification[])
      }
    } catch {
      // Supabase not configured — leave defaults
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openProfileEdit() {
    if (!profile) return
    setProfileForm({
      parent_name: profile.parent_name || '',
      child_name: profile.child_name || '',
      child_dob: profile.child_dob || '',
      phone: profile.phone || '',
      county: profile.county || '',
      household_income: profile.household_income || '',
      household_size: profile.household_size || undefined,
      relationship: profile.relationship || '',
      has_medicaid: profile.has_medicaid ?? undefined,
      citizenship_status: profile.citizenship_status || '',
      living_situation: profile.living_situation || '',
      employment_status: profile.employment_status || '',
      waiver_waitlist: profile.waiver_waitlist || '',
      notification_breaking_news: profile.notification_breaking_news,
      notification_milestones: profile.notification_milestones,
      notification_digest: profile.notification_digest,
    })
    setEditingProfile(true)
  }

  async function saveProfile() {
    if (!profile) return
    setSavingProfile(true)
    const supabase = createClient()
    await supabase.from('profiles').update(profileForm).eq('id', profile.id)
    setSavingProfile(false)
    setEditingProfile(false)
    fetchData()
  }

  if (userError) {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-xl font-bold text-navy">Dashboard</h1>
        <p className="mt-3 text-sm text-navy/50">
          The database is not configured yet. Please set up Supabase to use the dashboard.
        </p>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-navy/50">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Action Plan Banner */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASING }}
      >
        <a
          href="/plan"
          className="block bg-gradient-to-r from-coral to-coral/80 text-white rounded-xl p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">
                {profile?.child_dob && profile?.diagnosis
                  ? 'View Your Action Plan →'
                  : 'Generate Your Personalized Action Plan →'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                A step-by-step guide tailored to {profile?.child_name || 'your child'}&apos;s needs
              </p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </a>
      </motion.div>

      {/* First-Login Feature Guide */}
      <AnimatePresence>
        {showGuide && <FeatureGuideCard onDismiss={dismissGuide} />}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASING }}
      >
        <AnimatePresence mode="wait">
          {editingProfile ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-navy">Edit Profile</h2>
                <button onClick={() => setEditingProfile(false)} className="text-navy/40 hover:text-navy"><XIcon size={18} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Parent Name</label>
                  <input value={profileForm.parent_name || ''} onChange={(e) => setProfileForm((f) => ({ ...f, parent_name: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Child Name</label>
                  <input value={profileForm.child_name || ''} onChange={(e) => setProfileForm((f) => ({ ...f, child_name: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Child Date of Birth</label>
                  <input type="date" value={profileForm.child_dob || ''} onChange={(e) => setProfileForm((f) => ({ ...f, child_dob: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Phone</label>
                  <input type="tel" value={profileForm.phone || ''} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">County</label>
                  <input value={profileForm.county || ''} onChange={(e) => setProfileForm((f) => ({ ...f, county: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Household Size</label>
                  <input type="number" min={1} max={15} value={profileForm.household_size || ''} onChange={(e) => setProfileForm((f) => ({ ...f, household_size: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="e.g. 4"
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Household Income</label>
                  <select value={profileForm.household_income || ''} onChange={(e) => setProfileForm((f) => ({ ...f, household_income: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select range...</option>
                    <option value="under_25k">Under $25,000</option>
                    <option value="25k_50k">$25,000 – $50,000</option>
                    <option value="50k_75k">$50,000 – $75,000</option>
                    <option value="75k_100k">$75,000 – $100,000</option>
                    <option value="over_100k">Over $100,000</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Relationship</label>
                  <select value={profileForm.relationship || ''} onChange={(e) => setProfileForm((f) => ({ ...f, relationship: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="parent">Parent</option>
                    <option value="self">Self (individual with disability)</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Citizenship Status</label>
                  <select value={profileForm.citizenship_status || ''} onChange={(e) => setProfileForm((f) => ({ ...f, citizenship_status: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="citizen">U.S. Citizen</option>
                    <option value="permanent_resident">Lawful Permanent Resident</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Living Situation</label>
                  <select value={profileForm.living_situation || ''} onChange={(e) => setProfileForm((f) => ({ ...f, living_situation: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="home">At home with family</option>
                    <option value="group_home">Group home</option>
                    <option value="nursing_facility">Nursing facility</option>
                    <option value="independent">Independent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Employment Status</label>
                  <select value={profileForm.employment_status || ''} onChange={(e) => setProfileForm((f) => ({ ...f, employment_status: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="employed">Employed</option>
                    <option value="seeking">Looking for work</option>
                    <option value="not_working">Not working</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Has Medicaid?</label>
                  <select value={profileForm.has_medicaid === true ? 'yes' : profileForm.has_medicaid === false ? 'no' : ''} onChange={(e) => setProfileForm((f) => ({ ...f, has_medicaid: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-navy/50 mb-1 block">Waiver Waitlist</label>
                  <select value={profileForm.waiver_waitlist || ''} onChange={(e) => setProfileForm((f) => ({ ...f, waiver_waitlist: e.target.value || undefined }))}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                    <option value="">Select...</option>
                    <option value="now">NOW Waiver</option>
                    <option value="comp">COMP Waiver</option>
                    <option value="both">Both NOW & COMP</option>
                    <option value="none">Not on a waitlist</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-navy/60">Notification Preferences</p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'notification_breaking_news' as const, label: 'Breaking News' },
                    { key: 'notification_milestones' as const, label: 'Milestones' },
                    { key: 'notification_digest' as const, label: 'Weekly Digest' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
                      <input type="checkbox" checked={!!profileForm[key]}
                        onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={saveProfile} disabled={savingProfile}
                className="text-sm font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                    <HeartIcon size={20} className="text-coral sm:hidden" />
                    <HeartIcon size={24} className="text-coral hidden sm:block" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">
                      {profile?.parent_name ? `Welcome, ${profile.parent_name.split(' ')[0]}` : 'Dashboard'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-navy/50">
                      {profile?.child_name && (
                        <span>
                          <strong className="text-navy/70">{profile.child_name}</strong>
                          {profile.child_dob && ` · ${calcAge(profile.child_dob)}`}
                        </span>
                      )}
                      {profile?.county && <span>{profile.county} County</span>}
                      {profile?.phone && <span>{profile.phone}</span>}
                    </div>
                    {profile && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.notification_breaking_news && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">Breaking News</span>
                        )}
                        {profile.notification_milestones && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">Milestones</span>
                        )}
                        {profile.notification_digest && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Digest</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={openProfileEdit}
                  className="text-xs font-medium text-coral hover:text-coral-dark border border-coral/30 hover:border-coral px-3 py-1.5 rounded-lg transition-colors shrink-0">
                  Edit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        <QuickActions />

        {/* Notification Inbox */}
        <NotificationInbox notifications={notifications} onUpdate={fetchData} />

        {/* Benefits + Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <BenefitTracker benefits={benefits} profileId={profile?.id || ''} onUpdate={fetchData} />
          <ApplicationCard applications={applications} profile={profile} onUpdate={fetchData} onStartApplication={(prog) => setDrawerProgram(prog)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ReminderList reminders={reminders} profileId={profile?.id || ''} onUpdate={fetchData} />
          <DocumentList documents={documents} profileId={profile?.id || ''} onUpdate={fetchData} />
        </div>

        {profile && (
          <ContactsManager profileId={profile.id} onUpdate={fetchData} />
        )}
      </div>

      <NavigatorDrawer
        open={!!drawerProgram}
        onClose={() => setDrawerProgram(null)}
        mode="apply"
        program={drawerProgram ?? ''}
      />
    </div>
  )
}
