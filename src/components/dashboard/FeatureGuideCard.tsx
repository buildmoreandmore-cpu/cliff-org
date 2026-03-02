'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import {
  ChatIcon,
  ClipboardIcon,
  ShieldIcon,
  BellIcon,
  MailIcon,
  FileIcon,
  XIcon,
} from '@/components/ui/SVGIcons'

interface FeatureGuideCardProps {
  onDismiss: () => void
}

const FEATURES = [
  {
    Icon: ChatIcon,
    title: 'AI Navigator',
    description: 'Ask anything about SSI, Medicaid, and waivers',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    Icon: ClipboardIcon,
    title: 'Action Plan',
    description: 'Step-by-step roadmap tailored to your situation',
    color: 'text-coral',
    bg: 'bg-coral/10',
  },
  {
    Icon: ShieldIcon,
    title: 'Benefit Tracker',
    description: 'Track active benefits and renewal dates',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    Icon: BellIcon,
    title: 'Milestone Alerts',
    description: 'Reminders for age 18/21 and key deadlines',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    Icon: MailIcon,
    title: 'Email Drafter',
    description: 'Write letters to agencies in seconds',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    Icon: FileIcon,
    title: 'Document Intelligence',
    description: 'Upload denial letters and get next steps',
    color: 'text-navy',
    bg: 'bg-gray-100',
  },
] as const

export default function FeatureGuideCard({ onDismiss }: FeatureGuideCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-coral/20 p-5 sm:p-6 mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: EASING }}
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-display text-lg font-bold text-navy">
            Welcome to CLIFF — Here&apos;s What You Can Do
          </h2>
          <p className="text-sm text-navy/50 mt-0.5">
            You have access to AI-powered tools to help navigate disability benefits.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 shrink-0 p-1.5 text-navy/40 hover:text-navy transition-colors rounded-lg hover:bg-gray-50"
          aria-label="Dismiss guide"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {FEATURES.map(({ Icon, title, description, color, bg }) => (
          <div
            key={title}
            className="flex gap-3 p-3 rounded-lg bg-gray-50 items-start"
          >
            <div className={`shrink-0 w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">{title}</p>
              <p className="text-[11px] text-navy/50 mt-0.5 leading-tight">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-navy/40">You can revisit this by going to Resources.</p>
        <Link
          href="/resources"
          onClick={onDismiss}
          className="text-xs font-medium text-coral hover:text-coral-dark transition-colors"
        >
          Explore All Features →
        </Link>
      </div>
    </motion.div>
  )
}
