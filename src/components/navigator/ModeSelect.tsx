'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { NavigatorMode } from '@/lib/types'
import { SearchIcon, ClipboardIcon, MailIcon } from '@/components/ui/SVGIcons'

interface ModeSelectProps {
  onSelect: (mode: NavigatorMode) => void
}

const modes = [
  {
    id: 'explore' as NavigatorMode,
    title: 'Explore My Benefits',
    description: 'CLIFF reviews your profile and shows every program your family may qualify for — with phone numbers and next steps.',
    cta: 'Show me what I qualify for →',
    Icon: SearchIcon,
  },
  {
    id: 'apply' as NavigatorMode,
    title: 'Help Me Apply',
    description: 'Get walked through the most important application right now — section by section, with common mistakes flagged.',
    cta: 'Start my most urgent application →',
    Icon: ClipboardIcon,
  },
  {
    id: 'email' as NavigatorMode,
    title: 'Draft a Letter or Email',
    description: 'CLIFF drafts professional emails to caseworkers, agencies, or providers — including HIPAA complaints and appeal letters.',
    cta: 'Help me write something →',
    Icon: MailIcon,
  },
]

export default function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy">What do you need help with?</h2>
        <p className="mt-2 text-sm text-navy/50">Pick one and CLIFF will start working for you immediately.</p>
      </div>

      <motion.div
        className="grid gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-100 text-left hover:border-coral/30 hover:shadow-sm transition-all group"
            variants={{
              initial: { opacity: 0, y: 16, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.5, ease: EASING }}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
              <mode.Icon size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-navy">{mode.title}</h3>
              <p className="mt-1 text-sm text-navy/50">{mode.description}</p>
              <p className="mt-2 text-xs font-medium text-coral opacity-0 group-hover:opacity-100 transition-opacity">
                {mode.cta}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
