import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DonateStrip from '@/components/landing/DonateStrip'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cliff.org/#organization',
      name: 'CLIFF',
      url: 'https://cliff.org',
      description:
        'Free AI-powered navigator helping Georgia families of children with disabilities prepare for the benefits cliff at ages 18 and 21.',
      knowsAbout: [
        'Supplemental Security Income (SSI)',
        'Georgia Medicaid',
        'Katie Beckett Deeming Waiver',
        'NOW Waiver',
        'COMP Waiver',
        'SOURCE Waiver',
        'STABLE Account Georgia',
        'Disability transition planning',
        'Georgia disability advocacy',
      ],
      areaServed: {
        '@type': 'State',
        name: 'Georgia',
        sameAs: 'https://en.wikipedia.org/wiki/Georgia_(U.S._state)',
      },
      serviceType: [
        'Disability benefits navigation',
        'SSI application guidance',
        'Medicaid waiver information',
        'Transition planning for ages 18 and 21',
        'Disability advocacy tools',
        'Financial planning for disability families',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cliff.org/#website',
      url: 'https://cliff.org',
      name: 'CLIFF',
      description:
        'Navigate the benefits cliff for Georgia disability families. Free AI-powered guidance on SSI, Medicaid, waivers, and transition planning.',
      publisher: { '@id': 'https://cliff.org/#organization' },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <DonateStrip />
    </>
  )
}
