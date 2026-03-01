'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import AnimatedSection from '@/components/ui/AnimatedSection'
import {
  ChatIcon,
  GlobeIcon,
  ShieldIcon,
  BellIcon,
  ClipboardIcon,
  FileIcon,
  ScaleIcon,
  MailIcon,
  LockIcon,
  UsersIcon,
} from '@/components/ui/SVGIcons'

const agents = [
  {
    icon: ChatIcon,
    title: 'Navigator',
    description:
      'Conversational guide to SSI, Medicaid, all 7 GA waivers, and 60+ programs — personalized to your child\'s diagnosis, age, and county.',
  },
  {
    icon: GlobeIcon,
    title: 'Research Agent',
    description:
      'Searches real-time Georgia policy changes, contacts, waitlist updates, and regional office info when our library doesn\'t have the latest.',
  },
  {
    icon: ShieldIcon,
    title: 'Content Integrity',
    description:
      'Automatically verifies every phone number, eligibility rule, and deadline against official sources — so you never act on outdated info.',
  },
  {
    icon: BellIcon,
    title: 'Proactive Alerts',
    description:
      'Sends milestone warnings for 18th and 21st birthdays, HIPAA transition alerts, renewal deadlines, and breaking policy changes — months in advance.',
  },
  {
    icon: ClipboardIcon,
    title: 'Intake Screener',
    description:
      'Asks the right questions to surface every benefit your family qualifies for — waivers, SSI, DAC, ABLE accounts, housing, employment programs.',
  },
  {
    icon: FileIcon,
    title: 'Document Intelligence',
    description:
      'Upload denial letters, IEPs, or waiver determinations. AI extracts deadlines, flags appeal windows, and recommends next steps automatically.',
  },
  {
    icon: ScaleIcon,
    title: 'Advocacy Intelligence',
    description:
      'Tracks Georgia disability legislation, generates advocacy emails to representatives, and alerts you to bills that affect your family.',
  },
  {
    icon: MailIcon,
    title: 'Weekly Digest',
    description:
      'Personalized weekly summary of upcoming deadlines, new notifications, recommended applications, and proactive tips — delivered to your inbox.',
  },
]

const hipaaFeatures = [
  {
    icon: LockIcon,
    title: 'HIPAA Violation Detection',
    description:
      'Tell us what happened. Our Navigator recognizes HIPAA red flags — denied records, unauthorized disclosures, age-18 access loss — and walks you through your rights.',
  },
  {
    icon: FileIcon,
    title: 'Complaint Draft Generator',
    description:
      'Automatically generates a pre-filled HHS OCR complaint letter with your details, ready to print, sign, and file online or by mail. Sets a 180-day deadline reminder.',
  },
  {
    icon: UsersIcon,
    title: 'Family Advice Board',
    description:
      'Parents share real tips by county and category. Request to connect with families who\'ve navigated the same challenges. Privacy-first — no contact info exposed.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* 8 AI Agents */}
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">How CLIFF Works</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            Everything Your Family Needs. Powered by AI.
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF works around the clock — navigating benefits, protecting your rights, 
            tracking deadlines, and surfacing programs you didn&apos;t know existed.
          </p>
        </AnimatedSection>

        <motion.div
          className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        >
          {agents.map((agent) => (
            <motion.div
              key={agent.title}
              className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.5, ease: EASING }}
            >
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral">
                <agent.icon size={20} />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-navy">{agent.title}</h3>
              <p className="mt-2 text-sm text-navy/60 leading-relaxed">{agent.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* HIPAA + Community */}
        <AnimatedSection className="max-w-2xl mx-auto text-center mt-20 sm:mt-28">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Your Rights, Enforced</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            HIPAA Protection Built In
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Most families don&apos;t know they can file a HIPAA complaint when a provider refuses records 
            or shares their child&apos;s diagnosis without consent. CLIFF does — and handles the paperwork.
          </p>
        </AnimatedSection>

        <motion.div
          className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {hipaaFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: EASING }}
            >
              <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
                <feature.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-navy">{feature.title}</h3>
              <p className="mt-2 text-sm text-navy/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
