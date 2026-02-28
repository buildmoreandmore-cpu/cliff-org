'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import { externalLinks } from '@/data/external-links'
import { ExternalLinkIcon } from '@/components/ui/SVGIcons'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
        <AnimatedSection>
          <p className="text-coral font-medium text-sm tracking-wide uppercase">About</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy">
            Our Mission
          </h1>
          <p className="mt-6 text-navy/70 leading-relaxed">
            CLIFF exists because no Georgia family should face the benefits cliff alone. When a child
            with a disability turns 18 or 21, critical services and benefits can vanish overnight.
            Families are expected to navigate a maze of agencies, forms, and deadlines — often
            learning about them too late.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mt-12">
          <h2 className="font-display text-2xl font-bold text-navy">Our Story</h2>
          <p className="mt-4 text-navy/70 leading-relaxed">
            CLIFF was founded by families who lived through the benefits cliff and discovered how
            fragmented and inaccessible the system is. We built an AI-powered navigator to give
            every family the guidance that should already exist — specific, actionable, and
            personalized to their child and county.
          </p>
          <p className="mt-4 text-navy/70 leading-relaxed">
            Our Navigator knows the forms, the phone numbers, the deadlines, and the common mistakes.
            It walks families through applications section by section, drafts emails to caseworkers,
            and tracks every benefit and deadline in one dashboard.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="mt-12">
          <h2 className="font-display text-2xl font-bold text-navy">What We Cover</h2>
          <ul className="mt-4 space-y-3">
            {[
              'SSI applications and age-18 redetermination',
              'Katie Beckett / Deeming Waiver applications',
              'NOW & COMP Waiver Planning List enrollment',
              'GAPP for medically fragile children',
              'IEP transition planning',
              'Georgia ABLE account setup',
              'Employment services through Bobby Dodd Institute',
              'Advocacy connections through Parent to Parent GA',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-navy/70">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </AnimatedSection>

        <AnimatedSection delay={0.4} className="mt-12">
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

        <AnimatedSection delay={0.5} className="mt-12 p-4 sm:p-6 bg-cream rounded-xl">
          <h2 className="font-display text-lg font-semibold text-navy">Legal Disclaimer</h2>
          <p className="mt-2 text-sm text-navy/60 leading-relaxed">
            CLIFF provides general information about Georgia disability benefits and services. This
            information is not legal, medical, or financial advice. Every family&apos;s situation is
            unique. Always consult qualified professionals — including attorneys, physicians, and
            certified benefits counselors — for advice specific to your circumstances. CLIFF is not
            affiliated with any government agency.
          </p>
        </AnimatedSection>
      </div>
    </div>
  )
}
