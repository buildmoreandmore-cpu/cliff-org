'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'

const impacts = [
  { amount: '$10', impact: 'Powers ~50 AI agent conversations — helping a family explore benefits, draft emails, or walk through forms.' },
  { amount: '$50', impact: 'Funds a full benefits assessment and form walk-through for one Georgia family.' },
  { amount: '$250', impact: 'Keeps all 7 AI agents running for families across a county for a month.' },
]

export default function ImpactCards() {
  return (
    <motion.div
      className="space-y-4"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      <h3 className="font-display text-lg font-semibold text-navy">Your Impact</h3>
      {impacts.map((item) => (
        <motion.div
          key={item.amount}
          className="p-4 rounded-lg border border-gray-100 bg-cream/50"
          variants={{
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: EASING }}
        >
          <span className="font-display font-bold text-coral">{item.amount}</span>
          <p className="mt-1 text-sm text-navy/60">{item.impact}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
