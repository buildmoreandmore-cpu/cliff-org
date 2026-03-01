import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donate — Support Georgia Disability Families',
  description:
    'Support CLIFF in providing free AI-powered disability benefits navigation to Georgia families. Your donation helps families prepare for the benefits cliff at ages 18 and 21.',
  keywords: [
    'donate disability families Georgia',
    'support disability nonprofit',
    'CLIFF donation',
    'Georgia disability charity',
    'benefits cliff support',
  ],
  alternates: {
    canonical: 'https://cliff.org/donate',
  },
  openGraph: {
    title: 'Donate — Support Georgia Disability Families',
    description:
      'Support CLIFF in providing free disability benefits navigation to Georgia families.',
    url: 'https://cliff.org/donate',
  },
}

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
