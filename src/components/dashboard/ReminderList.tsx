'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { Reminder } from '@/lib/types'
import { BellIcon, CheckIcon, XIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'

interface ReminderListProps {
  reminders: Reminder[]
  profileId: string
  onUpdate: () => void
}

const CATEGORY_OPTIONS = ['application', 'renewal', 'appointment', 'follow-up', 'other']

export default function ReminderList({ reminders, profileId, onUpdate }: ReminderListProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', due_date: '', category: 'other', description: '' })
  const [saving, setSaving] = useState(false)

  async function toggleComplete(id: string, currentState: boolean) {
    const supabase = createClient()
    const updates: Record<string, unknown> = { is_complete: !currentState }
    if (!currentState) updates.completed_at = new Date().toISOString()
    else updates.completed_at = null
    await supabase.from('reminders').update(updates).eq('id', id)
    onUpdate()
  }

  async function handleAdd() {
    if (!form.title || !form.due_date) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('reminders').insert({
      profile_id: profileId,
      title: form.title,
      due_date: form.due_date,
      category: form.category,
      description: form.description || null,
      is_complete: false,
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', due_date: '', category: 'other', description: '' })
    onUpdate()
  }

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellIcon size={18} className="text-coral" />
          <h2 className="font-display text-lg font-semibold text-navy">Reminders</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-white bg-coral hover:bg-coral-dark px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Reminder
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
                <p className="text-sm font-semibold text-navy">New Reminder</p>
                <button onClick={() => setShowForm(false)} className="text-navy/40 hover:text-navy"><XIcon size={16} /></button>
              </div>
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
              <button onClick={handleAdd} disabled={saving || !form.title || !form.due_date}
                className="text-sm font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save Reminder'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 && !showForm ? (
        <p className="text-sm text-navy/40 py-4">
          No reminders yet. Add deadlines and follow-ups to stay on track.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((reminder) => {
            const isOverdue = !reminder.is_complete && new Date(reminder.due_date) < new Date()
            return (
              <div key={reminder.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <button
                  onClick={() => toggleComplete(reminder.id, reminder.is_complete)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    reminder.is_complete
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-coral'
                  }`}
                >
                  {reminder.is_complete && <CheckIcon size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${reminder.is_complete ? 'text-navy/30 line-through' : 'text-navy'}`}>
                    {reminder.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-navy/40'}`}>
                    {isOverdue ? 'Overdue: ' : 'Due: '}
                    {new Date(reminder.due_date).toLocaleDateString()}
                  </p>
                  {reminder.category && <p className="text-xs text-navy/30 mt-0.5">{reminder.category}</p>}
                  {reminder.description && <p className="text-xs text-navy/40 mt-0.5">{reminder.description}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
