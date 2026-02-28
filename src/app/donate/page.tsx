'use client'

import { useState } from 'react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Button from '@/components/ui/Button'
import AmountSelector from '@/components/donate/AmountSelector'
import TypeToggle from '@/components/donate/TypeToggle'
import ImpactCards from '@/components/donate/ImpactCards'

export default function DonatePage() {
  const [amount, setAmount] = useState<number | null>(50)
  const [custom, setCustom] = useState('')
  const [type, setType] = useState<'one-time' | 'monthly'>('one-time')

  const displayAmount = custom ? `$${custom}` : amount ? `$${amount}` : null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Support CLIFF</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy">
            Help Families Navigate the Cliff
          </h1>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF is 100% free for families. Your donation keeps our AI Navigator running and our
            Georgia-specific resources current.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="space-y-6">
              <TypeToggle type={type} onChange={setType} />
              <AmountSelector
                selected={amount}
                onSelect={setAmount}
                custom={custom}
                onCustomChange={setCustom}
              />

              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    // Stripe integration placeholder
                    alert(
                      `Thank you! Stripe checkout for ${displayAmount} ${type} donation will open here.`
                    )
                  }}
                >
                  {displayAmount
                    ? `Donate ${displayAmount} ${type === 'monthly' ? '/ month' : ''}`
                    : 'Select an Amount'}
                </Button>
                <p className="mt-3 text-xs text-navy/40 text-center">
                  Secure payment processed by Stripe. CLIFF is a 501(c)(3) nonprofit.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ImpactCards />
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
