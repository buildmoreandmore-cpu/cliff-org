'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ChildBenefit, BenefitStatus } from '@/lib/types'
import { ShieldIcon, XIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'

interface BenefitTrackerProps {
  benefits: ChildBenefit[]
  profileId: string
  onUpdate: () => void
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  denied: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
  ending_soon: 'bg-orange-100 text-orange-700',
}

const STATUS_OPTIONS: BenefitStatus[] = ['active', 'pending', 'denied', 'expired', 'ending_soon']

const COMMON_BENEFITS = [
  'SSI', 'Georgia Medicaid', 'Katie Beckett Waiver', 'NOW Waiver', 'COMP Waiver',
  'EPSDT', 'GAPP', 'Vocational Rehabilitation', 'ABLE Account', 'Other',
]

const emptyForm = { benefit_name: '', status: 'pending' as BenefitStatus, start_date: '', end_date: '', notes: '' }

export default function BenefitTracker({ benefits, profileId, onUpdate }: BenefitTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(b: ChildBenefit) {
    setForm({ benefit_name: b.benefit_name, status: b.status, start_date: b.start_date || '', end_date: b.end_date || '', notes: b.notes || '' })
    setEditingId(b.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.benefit_name) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      profile_id: profileId,
      benefit_name: form.benefit_name,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      notes: form.notes || null,
    }
    if (editingId) {
      await supabase.from('child_benefits').update(payload).eq('id', editingId)
    } else {
      await supabase.from('child_benefits').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    onUpdate()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('child_benefits').delete().eq('id', id)
    onUpdate()
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldIcon size={18} className="text-coral" />
          <h2 className="font-display text-lg font-semibold text-navy">Benefit Tracker</h2>
        </div>
        <button onClick={openAdd}
          className="text-xs font-medium text-white bg-coral hover:bg-coral-dark px-3 py-1.5 rounded-lg transition-colors">
          + Add Benefit
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
                <p className="text-sm font-semibold text-navy">{editingId ? 'Edit Benefit' : 'New Benefit'}</p>
                <button onClick={() => setShowForm(false)} className="text-navy/40 hover:text-navy"><XIcon size={16} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={form.benefit_name} onChange={(e) => setForm((f) => ({ ...f, benefit_name: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                  <option value="">Select benefit...</option>
                  {COMMON_BENEFITS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BenefitStatus }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy bg-white">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <input type="date" placeholder="Start date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
                <input type="date" placeholder="End date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 text-navy" />
              </div>
              <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30" />
              <button onClick={handleSave} disabled={saving || !form.benefit_name}
                className="text-sm font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : editingId ? 'Update Benefit' : 'Save Benefit'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {benefits.length === 0 && !showForm ? (
        <p className="text-sm text-navy/40 py-4">
          No benefits tracked yet. Add your active and pending benefits.
        </p>
      ) : (
        <div className="space-y-3">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy">{benefit.benefit_name}</p>
                {benefit.notes && <p className="text-xs text-navy/40 mt-0.5">{benefit.notes}</p>}
                {benefit.end_date && <p className="text-xs text-navy/30 mt-0.5">Ends: {new Date(benefit.end_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[benefit.status] || 'bg-gray-100 text-gray-500'}`}>
                  {benefit.status.replace('_', ' ')}
                </span>
                <button onClick={() => openEdit(benefit)} className="text-xs text-navy/40 hover:text-coral">Edit</button>
                <button onClick={() => handleDelete(benefit.id)} className="text-xs text-navy/40 hover:text-red-500">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
