'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import QuickActions from '@/components/dashboard/QuickActions'
import BenefitTracker from '@/components/dashboard/BenefitTracker'
import ApplicationCard from '@/components/dashboard/ApplicationCard'
import ReminderList from '@/components/dashboard/ReminderList'
import DocumentList from '@/components/dashboard/DocumentList'
import ContactsManager from '@/components/dashboard/ContactsManager'
import type { ChildBenefit, Application, Reminder, SavedDocument, Profile } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [benefits, setBenefits] = useState<ChildBenefit[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<SavedDocument[]>([])

  const fetchData = useCallback(async () => {
    if (!user) return
    const supabase = createClient()

    const profileRes = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    const prof = profileRes.data as Profile | null
    setProfile(prof)

    if (prof) {
      const [benefitsRes, appsRes, remindersRes, docsRes] = await Promise.all([
        supabase.from('child_benefits').select('*').eq('profile_id', prof.id),
        supabase.from('applications').select('*').eq('profile_id', prof.id),
        supabase.from('reminders').select('*').eq('profile_id', prof.id).order('due_date'),
        supabase.from('saved_documents').select('*').eq('profile_id', prof.id).order('id', { ascending: false }),
      ])

      setBenefits((benefitsRes.data || []) as ChildBenefit[])
      setApplications((appsRes.data || []) as Application[])
      setReminders((remindersRes.data || []) as Reminder[])
      setDocuments((docsRes.data || []) as SavedDocument[])
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-navy">
          {profile?.parent_name ? `Welcome, ${profile.parent_name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-navy/50">
          Track your benefits, applications, and deadlines.
        </p>
      </div>

      <div className="space-y-6">
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BenefitTracker benefits={benefits} />
          <ApplicationCard applications={applications} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReminderList reminders={reminders} onUpdate={fetchData} />
          <DocumentList documents={documents} />
        </div>

        {profile && (
          <ContactsManager
            profileId={profile.id}
            onUpdate={fetchData}
          />
        )}
      </div>
    </div>
  )
}
