'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { UsersIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/lib/types'

interface ContactsManagerProps {
  profileId: string
  onUpdate: () => void
}

export default function ContactsManager({ profileId, onUpdate }: ContactsManagerProps) {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('profile_id', profileId)
        .not('coordinator_name', 'is', null)
      setApplications((data || []) as Application[])
    }
    load()
  }, [profileId])

  const contacts = applications.filter((a) => a.coordinator_name)

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.15 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <UsersIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">My Contacts</h2>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No contacts yet. Coordinator info from your applications will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((app) => (
            <div
              key={app.id}
              className="py-3 border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy">{app.coordinator_name}</p>
                <p className="text-xs text-coral">{app.program_name}</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  {app.coordinator_phone && (
                    <a href={`tel:${app.coordinator_phone}`} className="text-xs text-navy/50 hover:text-coral">
                      {app.coordinator_phone}
                    </a>
                  )}
                  {app.coordinator_email && (
                    <a href={`mailto:${app.coordinator_email}`} className="text-xs text-navy/50 hover:text-coral">
                      {app.coordinator_email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
