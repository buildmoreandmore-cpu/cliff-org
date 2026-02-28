'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import Button from '@/components/ui/Button'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            className="text-coral font-medium text-sm tracking-wide uppercase"
            {...fadeUp}
            transition={{ duration: 0.5, ease: EASING }}
          >
            For Georgia Families
          </motion.p>

          <motion.h1
            className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight text-balance"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.12 }}
          >
            Navigate the Benefits Cliff with Confidence
          </motion.h1>

          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-xl text-navy/60 leading-relaxed max-w-2xl mx-auto"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.24 }}
          >
            When your child with a disability turns 18 or 21, everything changes. CLIFF is your
            free AI-powered guide to SSI, Medicaid, waivers, and every form in between.
          </motion.p>

          <motion.div
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.36 }}
          >
            <Button href="/auth/signup" size="lg">
              Start Free Navigator
            </Button>
            <Button href="/resources" variant="outline" size="lg">
              Browse Resources
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            { stat: '8+', label: 'Georgia Programs Covered' },
            { stat: '100%', label: 'Free for Families' },
            { stat: '24/7', label: 'AI Navigator Access' },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-sm border border-gray-100"
              variants={{
                initial: { opacity: 0, y: 20, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: EASING }}
            >
              <p className="font-display text-2xl sm:text-3xl font-bold text-coral">{item.stat}</p>
              <p className="mt-1 text-xs sm:text-sm text-navy/60">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
