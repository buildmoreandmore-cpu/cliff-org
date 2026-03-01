'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import AnimatedSection from '@/components/ui/AnimatedSection'

const timelineItems = [
  {
    age: 'Under 18',
    title: 'Child Benefits Active',
    description:
      'SSI, Katie Beckett, EPSDT, GAPP, school IEP services — a safety net your family depends on. Parents have full access to medical records.',
  },
  {
    age: 'Turning 18',
    title: 'The First Cliff',
    description:
      'Your child becomes a legal adult overnight. SSI redetermines. Katie Beckett may end. HIPAA rights transfer — you lose access to medical records without legal documentation. Guardianship decisions can\'t wait.',
  },
  {
    age: 'Turning 21',
    title: 'The Second Cliff',
    description:
      'EPSDT ends. GAPP ends. School services stop. The broadest coverage your child ever had disappears. Waiver waitlists are 5-15 years long.',
  },
  {
    age: 'After 21',
    title: 'The Gap',
    description:
      'Without planning, families face lost coverage, provider refusals, HIPAA lockouts, and a fragmented system with no guide. CLIFF makes sure you never get here unprepared.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">The Problem</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            The System Wasn&apos;t Built to Help You. We Were.
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Georgia families of children with disabilities face devastating service losses at ages 18 and 21.
            Most learn too late. The paperwork is buried. The deadlines are silent. And no one calls to warn you.
          </p>
        </AnimatedSection>

        <div className="mt-10 sm:mt-16 max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-coral/40 via-coral/20 to-transparent" />

            {timelineItems.map((item, i) => (
              <motion.div
                key={item.age}
                className="relative pl-12 pb-10 last:pb-0"
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: EASING, delay: i * 0.12 }}
              >
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-coral" />
                </div>
                <span className="text-xs font-medium text-coral uppercase tracking-wider">{item.age}</span>
                <h3 className="mt-1 font-display text-lg font-semibold text-navy">{item.title}</h3>
                <p className="mt-1 text-sm text-navy/60 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Urgency callout */}
        <AnimatedSection className="mt-12 sm:mt-16 max-w-3xl mx-auto">
          <div className="bg-coral/5 border border-coral/10 rounded-xl p-6 sm:p-8 text-center">
            <p className="font-display text-lg sm:text-xl font-semibold text-navy">
              Did you know?
            </p>
            <p className="mt-2 text-navy/60 leading-relaxed">
              At age 18, your child&apos;s HIPAA rights transfer to them — even with a disability. 
              Without a Healthcare Power of Attorney or HIPAA Authorization, providers are <strong className="text-navy">legally required</strong> to 
              refuse sharing medical information with you. Most families find out in the ER.
            </p>
            <p className="mt-4 text-sm text-coral font-medium">
              CLIFF alerts you 12 months before it happens.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
