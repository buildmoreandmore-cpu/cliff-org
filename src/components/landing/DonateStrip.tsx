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
            Every Family Deserves a Guide Through the Cliff
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Your donation powers 8 AI agents that protect families&apos; rights, navigate 60+ programs, 
            draft HIPAA complaints, and catch deadlines before they pass. 
            No family should lose benefits because the system didn&apos;t warn them.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/donate" size="lg">
              Donate Now
            </Button>
            <Button href="/support" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
          <p className="mt-4 text-xs text-navy/40">
            501(c)(3) status pending. All donations go directly to powering CLIFF for Georgia families.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
