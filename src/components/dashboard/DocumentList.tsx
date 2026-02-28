'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { SavedDocument } from '@/lib/types'
import { FileIcon } from '@/components/ui/SVGIcons'

interface DocumentListProps {
  documents: SavedDocument[]
}

const typeLabels: Record<string, string> = {
  email_draft: 'Email Draft',
  letter: 'Letter',
  form_notes: 'Form Notes',
  checklist: 'Checklist',
  other: 'Document',
}

export default function DocumentList({ documents }: DocumentListProps) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <FileIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Saved Documents</h2>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No documents saved. Email drafts and form notes from the Navigator appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 rounded bg-cream flex items-center justify-center">
                <FileIcon size={14} className="text-navy/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{doc.title}</p>
                <p className="text-xs text-navy/40">{typeLabels[doc.doc_type] || doc.doc_type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
