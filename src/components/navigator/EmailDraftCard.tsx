'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { EmailDraft } from '@/lib/types'
import { MailIcon, CheckIcon } from '@/components/ui/SVGIcons'
import Button from '@/components/ui/Button'

interface EmailDraftCardProps {
  draft: EmailDraft
}

export default function EmailDraftCard({ draft }: EmailDraftCardProps) {
  const [to, setTo] = useState(draft.to)
  const [subject, setSubject] = useState(draft.subject)
  const [body, setBody] = useState(draft.body)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = `To: ${to}\nSubject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASING }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <MailIcon size={16} className="text-coral" />
        <span className="text-sm font-medium text-navy">Email Draft</span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-navy/40 uppercase tracking-wider">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy"
          />
        </div>
        <div>
          <label className="text-xs text-navy/40 uppercase tracking-wider">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy"
          />
        </div>
        <div>
          <label className="text-xs text-navy/40 uppercase tracking-wider">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral text-navy resize-y"
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
        <Button size="sm" onClick={handleCopy} variant={copied ? 'secondary' : 'outline'}>
          {copied ? (
            <>
              <CheckIcon size={14} className="mr-1" /> Copied
            </>
          ) : (
            'Copy to Clipboard'
          )}
        </Button>
      </div>
    </motion.div>
  )
}
