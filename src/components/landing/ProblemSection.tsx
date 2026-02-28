'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import AnimatedSection from '@/components/ui/AnimatedSection'

const timelineItems = [
  {
    age: 'Under 18',
    title: 'Child Benefits Active',
    description: 'SSI, Katie Beckett, EPSDT, school IEP services — a safety net your family depends on.',
  },
  {
    age: 'Turning 18',
    title: 'The First Cliff',
    description: 'Your child becomes a legal adult. SSI redetermines using only their income. Katie Beckett may end. Guardianship decisions loom.',
  },
  {
    age: 'Turning 21',
    title: 'The Second Cliff',
    description: 'EPSDT ends. School services stop. Waiver waitlists are years long. Families are left without a roadmap.',
  },
  {
    age: 'After 21',
    title: 'The Gap',
    description: 'Without planning, families face lost coverage, service gaps, and a fragmented system with no guide.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">The Problem</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            The Benefits Cliff Is Real
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Georgia families of children with disabilities face devastating service losses at ages 18 and 21.
            Most learn about it too late.
          </p>
        </AnimatedSection>

        <div className="mt-10 sm:mt-16 max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

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
      </div>
    </section>
  )
}
