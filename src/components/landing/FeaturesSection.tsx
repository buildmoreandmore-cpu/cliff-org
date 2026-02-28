'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { ChatIcon, ClipboardIcon, ShieldIcon, CalendarIcon } from '@/components/ui/SVGIcons'

const features = [
  {
    icon: ChatIcon,
    title: 'AI Navigator',
    description: 'Ask questions in plain English. Get specific Georgia forms, phone numbers, and step-by-step guidance personalized to your child.',
  },
  {
    icon: ClipboardIcon,
    title: 'Form Walk-Through',
    description: 'The Navigator walks you through SSI, Katie Beckett, NOW/COMP, and more — section by section, catching common mistakes.',
  },
  {
    icon: ShieldIcon,
    title: 'Benefit Tracker',
    description: 'Track active benefits, pending applications, and upcoming deadlines in one dashboard. Never miss a renewal.',
  },
  {
    icon: CalendarIcon,
    title: 'Transition Timeline',
    description: 'Automated reminders for the 18 and 21 transitions. Know exactly what to do, months before each deadline.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">How CLIFF Helps</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            Everything You Need in One Place
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF combines AI intelligence with deep Georgia-specific knowledge to guide your family through every step.
          </p>
        </AnimatedSection>

        <motion.div
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.96 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: EASING }}
            >
              <div className="w-12 h-12 rounded-lg bg-coral/10 flex items-center justify-center text-coral">
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
