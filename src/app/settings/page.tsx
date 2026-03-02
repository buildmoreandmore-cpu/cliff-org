'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { BellIcon, MailIcon, PhoneIcon, CheckIcon } from '@/components/ui/SVGIcons'
import type { Profile } from '@/lib/types'

interface NotifPref {
  key: string
  label: string
  description: string
}

const NOTIFICATION_TYPES: NotifPref[] = [
  { key: 'notification_milestones', label: 'Milestone Alerts', description: 'Age 14, 17, 18, 21 transition reminders and benefit renewal deadlines' },
  { key: 'notification_breaking_news', label: 'Breaking News & Policy Changes', description: 'Georgia disability policy updates, new programs, and legislative changes' },
  { key: 'notification_digest', label: 'Weekly Digest', description: 'Personalized weekly summary of action items, deadlines, and recommendations' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [phone, setPhone] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) { router.push('/auth/login'); return }
        const data = await res.json()
        setProfile(data)
        setPhone(data.notification_phone || data.phone || '')
        setEmailEnabled(data.notification_email !== false)
        setSmsEnabled(data.notification_sms === true)
        const p: Record<string, boolean> = {}
        for (const nt of NOTIFICATION_TYPES) {
          p[nt.key] = data[nt.key] !== false
        }
        setPrefs(p)
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const save = useCallback(async () => {
    if (!profile) return
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_email: emailEnabled,
          notification_sms: smsEnabled,
          notification_phone: phone || null,
          ...prefs,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }, [profile, emailEnabled, smsEnabled, phone, prefs])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING }}
        >
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Notification Settings</h1>
          <p className="mt-2 text-sm text-navy/50">Choose how and when CLIFF reaches out to you.</p>
        </motion.div>

        {/* Delivery Methods */}
        <motion.div
          className="mt-8 bg-white rounded-xl border border-gray-100 p-5 sm:p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
        >
          <h2 className="font-display text-lg font-semibold text-navy flex items-center gap-2">
            <BellIcon size={20} className="text-coral" />
            Delivery Methods
          </h2>
          <p className="mt-1 text-xs text-navy/40">How should we send you updates?</p>

          <div className="mt-5 space-y-4">
            {/* Email toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MailIcon size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">Email</p>
                  <p className="text-xs text-navy/40">{profile?.notification_email !== false ? 'Sending to your account email' : 'Disabled'}</p>
                </div>
              </div>
              <button
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-coral' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${emailEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* SMS toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <PhoneIcon size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">Text Messages (SMS)</p>
                  <p className="text-xs text-navy/40">Get urgent alerts and reminders via text</p>
                </div>
              </div>
              <button
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${smsEnabled ? 'bg-coral' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${smsEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Phone number input (shown when SMS enabled) */}
            {smsEnabled && (
              <motion.div
                className="pl-12"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: EASING }}
              >
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
                <p className="mt-1 text-[11px] text-navy/30">US numbers only. Standard message rates may apply.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Notification Types */}
        <motion.div
          className="mt-5 bg-white rounded-xl border border-gray-100 p-5 sm:p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING, delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-navy">What to Send</h2>
          <p className="mt-1 text-xs text-navy/40">Pick the types of updates you want to receive.</p>

          <div className="mt-5 space-y-3">
            {NOTIFICATION_TYPES.map((nt) => (
              <div key={nt.key} className="flex items-start justify-between p-4 rounded-lg bg-gray-50">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-navy">{nt.label}</p>
                  <p className="mt-0.5 text-xs text-navy/40 leading-relaxed">{nt.description}</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, [nt.key]: !p[nt.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${prefs[nt.key] ? 'bg-coral' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs[nt.key] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save */}
        <motion.div
          className="mt-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {saved && (
            <motion.span
              className="flex items-center gap-1 text-sm text-green-600"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CheckIcon size={16} /> Saved!
            </motion.span>
          )}
        </motion.div>

        <p className="mt-6 text-xs text-navy/30 leading-relaxed">
          CLIFF will never share your contact information. You can change these settings at any time.
          Text message notifications are for urgent alerts only — we won&apos;t spam you.
        </p>
      </div>
    </div>
  )
}
