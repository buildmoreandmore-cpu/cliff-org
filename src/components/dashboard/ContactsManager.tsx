'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ProfileContact } from '@/lib/types'
import { UsersIcon, XIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface ContactsManagerProps {
  userId: string
  contacts: ProfileContact[]
  onUpdate: () => void
}

const emptyContact: ProfileContact = {
  name: '',
  role: '',
  phone: '',
  email: '',
  agency: '',
  notes: '',
}

export default function ContactsManager({ userId, contacts, onUpdate }: ContactsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ProfileContact>(emptyContact)
  const [saving, setSaving] = useState(false)

  function update(field: keyof ProfileContact, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)

    const supabase = createClient()
    const updated = [...contacts, form]
    await supabase.from('profiles').update({ contacts: updated }).eq('id', userId)

    setForm(emptyContact)
    setShowForm(false)
    setSaving(false)
    onUpdate()
  }

  async function handleRemove(index: number) {
    const supabase = createClient()
    const updated = contacts.filter((_, i) => i !== index)
    await supabase.from('profiles').update({ contacts: updated }).eq('id', userId)
    onUpdate()
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UsersIcon size={18} className="text-coral" />
          <h2 className="font-display text-lg font-semibold text-navy">My Contacts</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Contact'}
        </Button>
      </div>

      {contacts.length === 0 && !showForm && (
        <p className="text-sm text-navy/40 py-4">
          No contacts yet. Add caseworkers, service coordinators, or other key contacts.
        </p>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="mb-4 p-4 bg-cream rounded-lg space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASING }}
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Contact name *"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
              />
              <input
                type="text"
                placeholder="Role (e.g. Case Manager)"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
              />
            </div>
            <input
              type="text"
              placeholder="Agency / Organization"
              value={form.agency}
              onChange={(e) => update('agency', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy placeholder:text-navy/30"
            />
            <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : 'Save Contact'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {contacts.map((contact, i) => (
          <div
            key={i}
            className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy">{contact.name}</p>
              {contact.role && (
                <p className="text-xs text-coral">{contact.role}</p>
              )}
              {contact.agency && (
                <p className="text-xs text-navy/40">{contact.agency}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-1">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="text-xs text-navy/50 hover:text-coral">
                    {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="text-xs text-navy/50 hover:text-coral">
                    {contact.email}
                  </a>
                )}
              </div>
              {contact.notes && (
                <p className="text-xs text-navy/30 mt-1">{contact.notes}</p>
              )}
            </div>
            <button
              onClick={() => handleRemove(i)}
              className="p-1 text-navy/20 hover:text-red-400 transition-colors shrink-0"
              aria-label="Remove contact"
            >
              <XIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
