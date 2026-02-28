'use client'

import { motion } from 'framer-motion'

interface TypeToggleProps {
  type: 'one-time' | 'monthly'
  onChange: (type: 'one-time' | 'monthly') => void
}

export default function TypeToggle({ type, onChange }: TypeToggleProps) {
  return (
    <div className="relative flex bg-cream rounded-lg p-1">
      <motion.div
        className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm"
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ width: '50%', left: type === 'one-time' ? '4px' : '50%' }}
      />
      {(['one-time', 'monthly'] as const).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative z-10 flex-1 py-2 text-sm font-medium text-center transition-colors ${
            type === t ? 'text-navy' : 'text-navy/40'
          }`}
        >
          {t === 'one-time' ? 'One-Time' : 'Monthly'}
        </button>
      ))}
    </div>
  )
}
