'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { SearchIcon, ClipboardIcon, MailIcon, GlobeIcon, ShieldIcon, BellIcon, FileIcon } from '@/components/ui/SVGIcons'

const agents = [
  {
    icon: SearchIcon,
    title: 'Benefits Explorer',
    description: 'Answers questions about SSI, Medicaid, waivers, and eligibility in plain English — personalized to your child.',
  },
  {
    icon: ClipboardIcon,
    title: 'Form Walk-Through',
    description: 'Guides you through SSI, Katie Beckett, NOW/COMP, and more — section by section, catching common mistakes.',
  },
  {
    icon: MailIcon,
    title: 'Email Drafter',
    description: 'Drafts professional emails to caseworkers, agencies, and service providers so you get faster responses.',
  },
  {
    icon: GlobeIcon,
    title: 'Research Agent',
    description: 'Searches CLIFF\'s content library and the web for real-time Georgia policy info, contacts, and resources.',
  },
  {
    icon: ShieldIcon,
    title: 'Content Integrity Agent',
    description: 'Automatically verifies resources against official sources and flags outdated information.',
  },
  {
    icon: BellIcon,
    title: 'Proactive Alerts Agent',
    description: 'Sends personalized reminders for 18th and 21st birthday milestones, renewals, and policy changes.',
  },
  {
    icon: FileIcon,
    title: 'Benefit Tracker',
    description: 'Tracks active benefits, pending applications, deadlines, and documents in one dashboard.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">How CLIFF Helps</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            7 AI Agents Working for Your Family
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF deploys 7 specialized AI agents that work together to guide your family through benefits, applications, and transitions.
          </p>
        </AnimatedSection>

        <motion.div
          className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {agents.map((agent) => (
            <motion.div
              key={agent.title}
              className="bg-white rounded-xl p-5 sm:p-8 shadow-sm border border-gray-100"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: EASING }}
            >
              <div className="w-12 h-12 rounded-lg bg-coral/10 flex items-center justify-center text-coral">
                <agent.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-navy">{agent.title}</h3>
              <p className="mt-2 text-sm text-navy/60 leading-relaxed">{agent.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
