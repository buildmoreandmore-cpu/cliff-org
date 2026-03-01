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
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-coral font-medium text-sm tracking-wide uppercase"
            {...fadeUp}
            transition={{ duration: 0.5, ease: EASING }}
          >
            Free for Georgia Families · All Disability Types
          </motion.p>

          <motion.h1
            className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-navy leading-[1.1] text-balance"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.12 }}
          >
            Your Family&apos;s Rights.{' '}
            <span className="text-coral">Protected.</span>
            <br className="hidden sm:block" />{' '}
            Your Family&apos;s Benefits.{' '}
            <span className="text-coral">Secured.</span>
          </motion.h1>

          <motion.p
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-navy/60 leading-relaxed max-w-2xl mx-auto"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.24 }}
          >
            When your child with a disability turns 18 or 21, services vanish, rights shift, and the system goes silent. 
            CLIFF is your free, AI-powered guide that navigates benefits, protects your HIPAA rights, 
            drafts complaints, and fights for every dollar your family is owed — before you even know to ask.
          </motion.p>

          <motion.div
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASING, delay: 0.36 }}
          >
            <Button href="/auth/signup" size="lg">
              Start Free — No Account Needed to Explore
            </Button>
            <Button href="/community" variant="outline" size="lg">
              Family Advice Board
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-xs text-navy/40"
            {...fadeUp}
            transition={{ duration: 0.5, ease: EASING, delay: 0.48 }}
          >
            No cost. No ads. No data sold. 501(c)(3) pending.
          </motion.p>
        </div>

        <motion.div
          className="mt-10 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-5 max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {[
            { stat: '60+', label: 'Georgia Programs Covered' },
            { stat: 'AI', label: 'Powered Intelligence' },
            { stat: '24/7', label: 'Always-On Navigator' },
            { stat: '100%', label: 'Free for Every Family' },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="bg-white rounded-xl p-3 sm:p-5 text-center shadow-sm border border-gray-100"
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
