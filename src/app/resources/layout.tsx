import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Georgia Disability Benefits Guide — SSI, Katie Beckett, NOW & COMP Waivers',
  description:
    'Comprehensive guide to Georgia disability benefits: SSI, Medicaid, Katie Beckett deeming waiver, NOW & COMP waivers, STABLE accounts, SOURCE waiver, employment programs, and advocacy resources.',
  keywords: [
    'Georgia disability benefits guide',
    'SSI disability Georgia',
    'Katie Beckett waiver',
    'NOW waiver Georgia',
    'COMP waiver Georgia',
    'SOURCE waiver Georgia',
    'STABLE account Georgia',
    'Medicaid waiver Georgia',
    'DBHDD planning list',
    'disability resources Georgia',
  ],
  alternates: {
    canonical: 'https://cliff.org/resources',
  },
  openGraph: {
    title: 'Georgia Disability Benefits Guide — SSI, Katie Beckett, NOW & COMP Waivers',
    description:
      'Comprehensive guide to Georgia disability benefits including SSI, Medicaid, waivers, financial planning, and advocacy resources.',
    url: 'https://cliff.org/resources',
  },
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
