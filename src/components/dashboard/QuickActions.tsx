'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { ChatIcon, ClipboardIcon, MailIcon, SearchIcon } from '@/components/ui/SVGIcons'

const actions = [
  {
    label: 'Explore Benefits',
    description: 'Learn what you qualify for',
    href: '/navigator?mode=explore',
    Icon: SearchIcon,
  },
  {
    label: 'Walk Through a Form',
    description: 'Get step-by-step help',
    href: '/navigator?mode=apply',
    Icon: ClipboardIcon,
  },
  {
    label: 'Draft an Email',
    description: 'Write to an agency',
    href: '/navigator?mode=email',
    Icon: MailIcon,
  },
  {
    label: 'Browse Resources',
    description: 'Georgia programs guide',
    href: '/resources',
    Icon: ChatIcon,
  },
]

export default function QuickActions() {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
    >
      {actions.map((action) => (
        <motion.div
          key={action.label}
          variants={{
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: EASING }}
        >
          <Link
            href={action.href}
            className="block p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:border-coral/20 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center text-coral mb-3 group-hover:bg-coral group-hover:text-white transition-colors">
              <action.Icon size={16} />
            </div>
            <p className="text-xs sm:text-sm font-medium text-navy">{action.label}</p>
            <p className="text-xs text-navy/40 mt-0.5 hidden sm:block">{action.description}</p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
