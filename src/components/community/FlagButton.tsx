'use client'

import { useState } from 'react'
import FlagModal from './FlagModal'

export default function FlagButton({ contentBlockSlug }: { contentBlockSlug?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-navy/30 hover:text-coral transition-colors mt-6 flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        Something missing or outdated on this page?
      </button>
      {open && <FlagModal contentBlockSlug={contentBlockSlug} onClose={() => setOpen(false)} />}
    </>
  )
}
