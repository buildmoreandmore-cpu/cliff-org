'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SendIcon, SearchIcon, ClipboardIcon, BellIcon, FileIcon, BookIcon, ShieldIcon, HeartIcon, UsersIcon } from '@/components/ui/SVGIcons'
import { EASING } from '@/lib/constants'

const CLIFF_TOOLS = [
  { Icon: SearchIcon, title: 'Navigator', description: 'Ask questions about any Georgia disability program — personalized to your family.', href: '/navigator', color: 'bg-blue-500' },
  { Icon: ClipboardIcon, title: 'My Action Plan', description: 'A step-by-step plan with the exact programs, deadlines, and phone numbers for your case.', href: '/plan', color: 'bg-coral' },
  { Icon: BookIcon, title: 'Lifestyle Journey', description: 'Understand your child\'s condition, outcomes, and how to prepare for every life stage.', href: '/journey', color: 'bg-purple-500' },
  { Icon: BellIcon, title: 'Proactive Alerts', description: 'Automatic warnings for milestone birthdays, HIPAA transitions, renewals, and policy changes.', href: '/dashboard', color: 'bg-orange-500' },
  { Icon: FileIcon, title: 'Document Intelligence', description: 'Upload denial letters or IEPs — we extract deadlines, flag appeals, and recommend next steps.', href: '/dashboard', color: 'bg-navy' },
  { Icon: ShieldIcon, title: 'HIPAA Protection', description: 'If a provider violates your rights, we draft a complaint letter and track the filing deadline.', href: '/navigator', color: 'bg-green-600' },
  { Icon: HeartIcon, title: 'Advocacy Hub', description: 'Track Georgia disability legislation and send advocacy emails to your representatives.', href: '/advocacy', color: 'bg-red-500' },
  { Icon: UsersIcon, title: 'Family Advice Board', description: 'Real tips from Georgia parents. Connect privately with families who\'ve been through it.', href: '/community', color: 'bg-teal-500' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [childName, setChildName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) { router.push('/auth/login'); return }
        const data = await res.json()
        if (!data?.child_name || !data?.diagnosis) {
          router.push('/intake')
          return
        }
        setChildName(data.child_name)
      } catch {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = childName?.split(' ')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASING }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy">
            You&apos;re All Set{firstName ? `, ${firstName}'s Family` : ''}!
          </h1>
          <p className="mt-3 text-navy/60 text-lg max-w-xl mx-auto">
            CLIFF is now personalized to your family. Here&apos;s everything that&apos;s working for you — explore at your own pace.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        >
          {CLIFF_TOOLS.map((tool) => (
            <motion.a
              key={tool.title}
              href={tool.href}
              className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-coral/30 hover:shadow-sm transition-all group"
              variants={{
                initial: { opacity: 0, y: 16, scale: 0.97 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5, ease: EASING }}
              whileHover={{ y: -2 }}
            >
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                <tool.Icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-navy">{tool.title}</h3>
                <p className="mt-0.5 text-xs text-navy/50 leading-relaxed">{tool.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-sm text-navy/40 mb-4">
            We recommend starting with your personalized Action Plan
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/plan"
              className="inline-flex items-center justify-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <ClipboardIcon size={18} />
              View My Action Plan
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-coral/30 text-navy font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
