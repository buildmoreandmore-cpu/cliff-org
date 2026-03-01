'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { SavedDocument, DocType } from '@/lib/types'
import { FileIcon, MailIcon, CheckIcon, BellIcon, XIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'

interface DocumentListProps {
  documents: SavedDocument[]
  profileId: string
  onUpdate: () => void
}

const typeLabels: Record<string, string> = {
  email_draft: 'Email Draft',
  letter: 'Letter',
  form_notes: 'Form Notes',
  checklist: 'Checklist',
  other: 'Document',
}

const ADD_DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'form_notes', label: 'Form Notes' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'letter', label: 'Letter' },
  { value: 'other', label: 'Other' },
]

export default function DocumentList({ documents, profileId, onUpdate }: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reminderDocId, setReminderDocId] = useState<string | null>(null)
  const [reminderForm, setReminderForm] = useState({ title: '', due_date: '', description: '' })
  const [copied, setCopied] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', content: '', doc_type: 'form_notes' as DocType })
  const [saving, setSaving] = useState(false)

  // Filter out contact docs
  const visibleDocs = documents.filter((d) => !(d.doc_type === 'other' && d.title.startsWith('contact:')))

  async function handleAddDocument() {
    if (!addForm.title.trim() || !addForm.content.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('saved_documents').insert({
      profile_id: profileId,
      doc_type: addForm.doc_type,
      title: addForm.title.trim(),
      content: addForm.content.trim(),
    })
    setSaving(false)
    setShowAddForm(false)
    setAddForm({ title: '', content: '', doc_type: 'form_notes' })
    onUpdate()
  }

  async function handleCopy(content: string, id: string) {
    await navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function markAsSent(id: string) {
    const supabase = createClient()
    await supabase.from('saved_documents').update({ is_sent: true, sent_at: new Date().toISOString() }).eq('id', id)
    onUpdate()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('saved_documents').delete().eq('id', id)
    onUpdate()
  }

  async function saveReminder(docId: string) {
    if (!reminderForm.title || !reminderForm.due_date) return
    const supabase = createClient()
    await supabase.from('reminders').insert({
      profile_id: profileId,
      title: reminderForm.title,
      due_date: reminderForm.due_date,
      description: reminderForm.description || null,
      category: 'follow-up',
      is_complete: false,
    })
    setReminderDocId(null)
    setReminderForm({ title: '', due_date: '', description: '' })
    onUpdate()
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileIcon size={18} className="text-coral" />
          <h2 className="font-display text-lg font-semibold text-navy">Saved Documents</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-medium text-coral hover:text-coral-dark border border-coral/30 hover:border-coral px-3 py-1.5 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border border-gray-100 rounded-lg p-3 mb-4 bg-cream/20 space-y-2">
              <input
                placeholder="Title"
                value={addForm.title}
                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 text-navy placeholder:text-navy/30"
              />
              <select
                value={addForm.doc_type}
                onChange={(e) => setAddForm((f) => ({ ...f, doc_type: e.target.value as DocType }))}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 text-navy bg-white"
              >
                {ADD_DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <textarea
                placeholder="Paste or type your notes here..."
                value={addForm.content}
                onChange={(e) => setAddForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-navy placeholder:text-navy/30 resize-none"
              />
              <button
                onClick={handleAddDocument}
                disabled={saving || !addForm.title.trim() || !addForm.content.trim()}
                className="text-xs font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Document'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {visibleDocs.length === 0 && !showAddForm ? (
        <p className="text-sm text-navy/40 py-4">
          No documents saved. Email drafts and form notes from the Navigator appear here.
        </p>
      ) : visibleDocs.length > 0 ? (
        <div className="space-y-2">
          {visibleDocs.map((doc) => {
            const isExpanded = expandedId === doc.id
            const isEmail = doc.doc_type === 'email_draft'
            return (
              <div key={doc.id} className="border border-gray-50 rounded-lg">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-cream/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                >
                  <div className="w-8 h-8 rounded bg-cream flex items-center justify-center shrink-0">
                    {isEmail ? <MailIcon size={14} className="text-navy/30" /> : <FileIcon size={14} className="text-navy/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{doc.title}</p>
                    <p className="text-xs text-navy/40">
                      {typeLabels[doc.doc_type] || doc.doc_type}
                      {doc.is_sent && <span className="ml-2 text-green-600">✓ Sent</span>}
                    </p>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 border-t border-gray-50 space-y-3">
                        {isEmail && (
                          <div className="text-xs text-navy/50 space-y-0.5">
                            {doc.recipient_email && <p><strong>To:</strong> {doc.recipient_name ? `${doc.recipient_name} <${doc.recipient_email}>` : doc.recipient_email}</p>}
                            {doc.subject && <p><strong>Subject:</strong> {doc.subject}</p>}
                          </div>
                        )}
                        <div className="text-sm text-navy/70 whitespace-pre-wrap bg-cream/30 rounded-md p-3 max-h-60 overflow-y-auto">
                          {doc.content}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCopy(doc.content, doc.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-navy/60 hover:text-coral hover:border-coral transition-colors"
                          >
                            {copied === doc.id ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => { setReminderDocId(reminderDocId === doc.id ? null : doc.id); setReminderForm({ title: `Follow up: ${doc.title}`, due_date: '', description: '' }) }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-navy/60 hover:text-coral hover:border-coral transition-colors flex items-center gap-1"
                          >
                            <BellIcon size={12} /> Set Reminder
                          </button>
                          {isEmail && !doc.is_sent && (
                            <button
                              onClick={() => markAsSent(doc.id)}
                              className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-navy/60 hover:text-green-600 hover:border-green-300 transition-colors flex items-center gap-1"
                            >
                              <CheckIcon size={12} /> Mark as Sent
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-navy/60 hover:text-red-500 hover:border-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Inline reminder form */}
                        <AnimatePresence>
                          {reminderDocId === doc.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border border-gray-100 rounded-md p-3 bg-cream/20 space-y-2">
                                <input
                                  placeholder="Reminder title"
                                  value={reminderForm.title}
                                  onChange={(e) => setReminderForm((f) => ({ ...f, title: e.target.value }))}
                                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 text-navy placeholder:text-navy/30"
                                />
                                <input
                                  type="date"
                                  value={reminderForm.due_date}
                                  onChange={(e) => setReminderForm((f) => ({ ...f, due_date: e.target.value }))}
                                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 text-navy"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => saveReminder(doc.id)} disabled={!reminderForm.title || !reminderForm.due_date}
                                    className="text-xs font-medium text-white bg-coral hover:bg-coral-dark disabled:opacity-50 px-3 py-1.5 rounded-md transition-colors">
                                    Save Reminder
                                  </button>
                                  <button onClick={() => setReminderDocId(null)} className="text-xs text-navy/40 hover:text-navy">Cancel</button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : null}
    </motion.div>
  )
}
