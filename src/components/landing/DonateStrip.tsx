'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import Button from '@/components/ui/Button'

export default function DonateStrip() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Support Our Mission</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy text-balance">
            Help Every Georgia Family Navigate the Cliff
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF is free for families because of donors like you. Your support keeps our AI Navigator running and our resources up to date.
          </p>
          <div className="mt-8">
            <Button href="/donate" size="lg">
              Donate Now
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
