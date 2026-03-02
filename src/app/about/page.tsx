'use client'

import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { externalLinks } from '@/data/external-links'
import {
  ExternalLinkIcon,
  ChatIcon,
  SearchIcon,
  ShieldIcon,
  BellIcon,
  ClipboardIcon,
  FileIcon,
  ScaleIcon,
  MailIcon,
  StarIcon,
  UsersIcon,
  HeartIcon,
} from '@/components/ui/SVGIcons'
import { EASING } from '@/lib/constants'

const COUNCIL_MEMBERS = [
  {
    name: 'Navigator',
    role: 'Chief Benefits Officer',
    desc: 'Frontline family guidance — answers questions about any of Georgia\'s 60+ disability programs, personalized to each family\'s situation.',
    Icon: ChatIcon,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-500',
  },
  {
    name: 'Research',
    role: 'Chief Intelligence Officer',
    desc: 'Real-time program research — searches live government sources, policy updates, and program databases to keep information current.',
    Icon: SearchIcon,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-500',
  },
  {
    name: 'Content Integrity',
    role: 'Compliance Officer',
    desc: 'Monthly fact-checking across all content — ensures every phone number, deadline, and eligibility requirement is accurate.',
    Icon: ShieldIcon,
    color: 'bg-green-600',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    name: 'Proactive Intelligence',
    role: 'Chief Alerts Officer',
    desc: 'Monitors milestone birthdays, HIPAA transitions, policy changes, and benefit renewals — alerts families before deadlines hit.',
    Icon: BellIcon,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-500',
  },
  {
    name: 'Intake',
    role: 'Director of Onboarding',
    desc: 'Screens and routes every family — collects key information in minutes and builds a personalized action plan on the spot.',
    Icon: ClipboardIcon,
    color: 'bg-coral',
    lightColor: 'bg-coral/10',
    textColor: 'text-coral',
  },
  {
    name: 'Document Intelligence',
    role: 'Chief Records Officer',
    desc: 'Analyzes denial letters, IEPs, and waiver determinations — extracts deadlines, flags appeal opportunities, recommends next steps.',
    Icon: FileIcon,
    color: 'bg-navy',
    lightColor: 'bg-gray-100',
    textColor: 'text-navy',
  },
  {
    name: 'Advocacy',
    role: 'Legislative Affairs Director',
    desc: 'Tracks Georgia disability legislation in real time — drafts advocacy emails to representatives and alerts families to policy threats.',
    Icon: ScaleIcon,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-500',
  },
  {
    name: 'Digest',
    role: 'Communications Director',
    desc: 'Weekly personalized briefings — summarizes new programs, deadline reminders, policy changes, and recommended actions for each family.',
    Icon: MailIcon,
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50',
    textColor: 'text-teal-500',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">

        {/* Mission */}
        <AnimatedSection>
          <p className="text-coral font-medium text-sm tracking-wide uppercase">About CLIFF</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy">
            The First Nonprofit Run by AI, Led by a Human
          </h1>
          <p className="mt-6 text-navy/70 leading-relaxed text-lg">
            CLIFF exists because no Georgia family should face the benefits cliff alone. When a child
            with a disability turns 18 or 21, critical services can vanish overnight.
            Families navigate a maze of agencies, forms, and deadlines — often learning about them too late.
          </p>
          <p className="mt-4 text-navy/70 leading-relaxed">
            We built something different: an organization where AI handles the work — research, monitoring,
            document analysis, advocacy — so that 100% of every donation goes directly to serving families.
            No bloated staff. No overhead. Just results.
          </p>
        </AnimatedSection>

        {/* Leadership */}
        <AnimatedSection delay={0.15} className="mt-16">
          <div className="text-center mb-10">
            <p className="text-coral font-medium text-sm tracking-wide uppercase">Leadership</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-navy">
              One Human. Eight AI Officers.
            </h2>
            <p className="mt-3 text-navy/50 max-w-2xl mx-auto">
              CLIFF is led by one person with a board of AI-powered officers — each responsible for a
              critical function. Every decision serves families. Every dollar is accountable.
            </p>
          </div>

          {/* CEO Card */}
          <motion.div
            className="relative bg-gradient-to-br from-navy to-navy/90 rounded-2xl p-6 sm:p-8 text-white mb-8 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASING }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-coral/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-coral flex items-center justify-center flex-shrink-0">
                <StarIcon size={32} className="text-white" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-coral text-xs font-semibold tracking-wider uppercase">President &amp; CEO</p>
                <h3 className="mt-1 font-display text-2xl font-bold">Martin Francis</h3>
                <p className="mt-2 text-white/70 leading-relaxed max-w-xl">
                  Founder of CLIFF and martin.builds. The only human in the organization — responsible for
                  strategy, fundraising, partnerships, and ensuring every AI officer serves families first.
                  All operational decisions, legal compliance, and fiduciary duties rest here.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80">Strategy</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80">Fundraising</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80">Partnerships</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80">Legal &amp; Compliance</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Org line */}
          <div className="flex justify-center mb-6">
            <div className="w-px h-8 bg-gray-200" />
          </div>
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 bg-coral/10 text-coral text-xs font-semibold rounded-full tracking-wide uppercase">
              AI Advisory Council
            </span>
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-px h-6 bg-gray-200" />
          </div>

          {/* AI Council Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
          >
            {COUNCIL_MEMBERS.map((member) => (
              <motion.div
                key={member.name}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-coral/20 hover:shadow-sm transition-all"
                variants={{
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: EASING }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${member.lightColor} flex items-center justify-center flex-shrink-0`}>
                    <member.Icon size={20} className={member.textColor} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold tracking-wide uppercase ${member.textColor}`}>
                      {member.role}
                    </p>
                    <h3 className="font-display text-base font-bold text-navy mt-0.5">
                      {member.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-navy/50 leading-relaxed">
                      {member.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>

        {/* Why AI */}
        <AnimatedSection delay={0.3} className="mt-16">
          <div className="bg-cream rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-navy">Why an AI-Powered Team?</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center mb-3">
                  <HeartIcon size={20} className="text-coral" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy">100% to Families</h3>
                <p className="mt-1 text-xs text-navy/50 leading-relaxed">
                  No salaries, no office space, no overhead. Every dollar donated goes directly to serving families.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center mb-3">
                  <BellIcon size={20} className="text-coral" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy">24/7, Never Sleeps</h3>
                <p className="mt-1 text-xs text-navy/50 leading-relaxed">
                  Benefits don&apos;t wait for business hours. Families get help at 2 AM, on weekends, and on holidays.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center mb-3">
                  <UsersIcon size={20} className="text-coral" />
                </div>
                <h3 className="font-display text-sm font-bold text-navy">Scales to Every Family</h3>
                <p className="mt-1 text-xs text-navy/50 leading-relaxed">
                  Whether 10 families or 10,000 — the same quality, same speed, same personalization for everyone.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* What We Cover */}
        <AnimatedSection delay={0.35} className="mt-16">
          <h2 className="font-display text-2xl font-bold text-navy">What We Cover</h2>
          <ul className="mt-4 space-y-3">
            {[
              'SSI applications and age-18 redetermination',
              'Katie Beckett / Deeming Waiver applications',
              'NOW & COMP Waiver Planning List enrollment',
              'GAPP for medically fragile children',
              'IEP transition planning (ages 14–21)',
              'HIPAA rights, violations, and complaint filing',
              'Georgia STABLE account setup',
              'Employment services and Vocational Rehabilitation',
              'Housing resources (Section 8, HCV, SSVF)',
              'Advocacy connections through Parent to Parent GA',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-navy/70">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </AnimatedSection>

        {/* Partners */}
        <AnimatedSection delay={0.4} className="mt-16">
          <h2 className="font-display text-2xl font-bold text-navy">Partner Organizations</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {externalLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 text-sm text-navy/70 hover:text-coral hover:border-coral/20 transition-colors"
              >
                <ExternalLinkIcon size={14} className="shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.45} className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold text-navy">Ready to Get Started?</h2>
          <p className="mt-3 text-navy/50">
            CLIFF is free for every Georgia family. No cost, no catches.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/donate"
              className="inline-flex items-center justify-center border border-gray-200 hover:border-coral/30 text-navy font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Support Our Mission
            </a>
          </div>
        </AnimatedSection>

        {/* Legal */}
        <AnimatedSection delay={0.5} className="mt-16 p-4 sm:p-6 bg-cream rounded-xl">
          <h2 className="font-display text-lg font-semibold text-navy">Legal Disclaimer</h2>
          <p className="mt-2 text-sm text-navy/60 leading-relaxed">
            CLIFF provides general information about Georgia disability benefits and services. This
            information is not legal, medical, or financial advice. Every family&apos;s situation is
            unique. Always consult qualified professionals — including attorneys, physicians, and
            certified benefits counselors — for advice specific to your circumstances. CLIFF is not
            affiliated with any government agency. 501(c)(3) status pending.
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}
