'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { UsersIcon, XIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'
import type { ProfileContact } from '@/lib/types'

interface ContactsManagerProps {
  profileId: string
  onUpdate: () => void
}

interface StoredContact extends ProfileContact {
  docId: string
}

const ROLE_OPTIONS = ['caseworker', 'coordinator', 'doctor', 'therapist', 'attorney', 'school', 'agency', 'other']

const emptyForm: ProfileContact = { name: '', role: 'caseworker', phone: '', email: '', agency: '', notes: '' }

export default function ContactsManager({ profileId, onUpdate }: ContactsManagerProps) {
  const [contacts, setContacts] = useState<StoredContact[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileContact>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadContacts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('saved_documents')
      .select('*')
      .eq('profile_id', profileId)
      .eq('doc_type', 'other')
      .like('title', 'contact:%')
    const parsed: StoredContact[] = (data || []).map((d: any) => {
      try {
        const c = JSON.parse(d.content) as ProfileContact
        return { ...c, docId: d.id }
      } catch {
        return { ...emptyForm, docId: d.id }
      }
    })
    setContacts(parsed)
  }

  useEffect(() => { loadContacts() }, [profileId])

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(c: StoredContact) {
    setForm({ name: c.name, role: c.role, phone: c.phone, email: c.email, agency: c.agency, notes: c.notes })
    setEditingId(c.docId)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      profile_id: profileId,
      doc_type: 'other' as const,
      title: `contact:${form.name}`,
      content: JSON.stringify(form),
      subject: form.role,
      recipient_name: form.name,
      recipient_email: form.email || null,
      is_sent: false,
    }
    if (editingId) {
      await supabase.from('saved_documents').update(payload).eq('id', editingId)
    } else {
      await supabase.from('saved_documents').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    loadContacts()
    onUpdate()
  }

  async function handleDelete(docId: string) {
    const supabase = createClient()
    await supabase.from('saved_documents').delete().eq('id', docId)
    loadContacts()
    onUpdate()
  }

  function setField(key: keyof ProfileContact, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
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
        <button
          onClick={openAdd}
          className="text-xs font-medium text-white bg-coral hover:bg-coral-dark px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Contact
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="border border-gray-100 rounded-lg p-4 bg-cream/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">{editingId ? 'Edit Contact' : 'New Contact'}</p>
                <button onClick={() => setShowForm(false)} className="text-navy/40 hover:text-navy"><XIcon size={16} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Name *" value={form.name} onChange={(e) => setField('name', e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
                <select value={form.role} onChange={(e) => setField('role', e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                <input placeholder="Phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} type="tel"
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
                <input placeholder="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} type="email"
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
                <input placeholder="Agency" value={form.agency} onChange={(e) => setField('agency', e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
                <input placeholder="Notes" value={form.notes} onChange={(e) => setField('notes', e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
              </div>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="text-sm font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contacts.length === 0 && !showForm ? (
        <p className="text-sm text-navy/40 py-4">
          No contacts yet. Add your caseworkers, doctors, and other important contacts.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.docId} className="py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">{c.name}</p>
                  <p className="text-xs text-coral capitalize">{c.role}{c.agency ? ` · ${c.agency}` : ''}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {c.phone && <a href={`tel:${c.phone}`} className="text-xs text-navy/50 hover:text-coral">{c.phone}</a>}
                    {c.email && <a href={`mailto:${c.email}`} className="text-xs text-navy/50 hover:text-coral">{c.email}</a>}
                  </div>
                  {c.notes && <p className="text-xs text-navy/40 mt-1">{c.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(c)} className="text-xs text-navy/40 hover:text-coral">Edit</button>
                  <button onClick={() => handleDelete(c.docId)} className="text-xs text-navy/40 hover:text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
