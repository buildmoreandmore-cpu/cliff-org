import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DonateStrip from '@/components/landing/DonateStrip'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://meetcliff.org/#organization',
      name: 'CLIFF',
      url: 'https://meetcliff.org',
      description:
        'Free AI-powered platform with 8 agents helping Georgia families of people with ALL disability types navigate the benefits cliff at ages 18 and 21. Covers 60+ programs, HIPAA rights protection, complaint filing, document intelligence, advocacy, and community support.',
      knowsAbout: [
        'Supplemental Security Income (SSI)',
        'Georgia Medicaid',
        'Katie Beckett Deeming Waiver',
        'NOW Waiver',
        'COMP Waiver',
        'ICWP',
        'SOURCE Waiver',
        'CCSP',
        'EDWP',
        'GAPP',
        'STABLE Account Georgia',
        'Disability transition planning',
        'Georgia disability advocacy',
        'HIPAA rights for disability families',
        'HIPAA complaint filing',
        'Disabled Adult Child benefits',
        'EPSDT',
        'Medicaid Buy-In for Workers with Disabilities',
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
        'HIPAA violation complaint assistance',
        'Document intelligence for denial letters and IEPs',
        'Legislative advocacy for disability rights',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://meetcliff.org/#website',
      url: 'https://meetcliff.org',
      name: 'CLIFF — Your Family\'s Rights. Protected. Your Family\'s Benefits. Secured.',
      description:
        'Navigate the benefits cliff for Georgia disability families. 8 free AI agents covering 60+ programs, HIPAA protection, document analysis, advocacy, and community support.',
      publisher: { '@id': 'https://meetcliff.org/#organization' },
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
