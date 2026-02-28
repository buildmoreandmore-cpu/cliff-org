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
    title: 'Explore Benefits',
    description: 'Learn about SSI, Medicaid, waivers, and what your family qualifies for.',
    Icon: SearchIcon,
  },
  {
    id: 'apply' as NavigatorMode,
    title: 'Walk Through Forms',
    description: 'Get step-by-step help filling out SSI, Katie Beckett, NOW/COMP, and more.',
    Icon: ClipboardIcon,
  },
  {
    id: 'email' as NavigatorMode,
    title: 'Draft Communications',
    description: 'Write emails to caseworkers, agencies, and service providers.',
    Icon: MailIcon,
  },
]

export default function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy">How can I help today?</h2>
        <p className="mt-2 text-sm text-navy/50">Choose a mode to get started.</p>
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
            className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-100 text-left hover:border-coral/30 hover:shadow-sm transition-colors"
            variants={{
              initial: { opacity: 0, y: 16, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.5, ease: EASING }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral shrink-0">
              <mode.Icon size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-navy">{mode.title}</h3>
              <p className="mt-1 text-sm text-navy/50">{mode.description}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
