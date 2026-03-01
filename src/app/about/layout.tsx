import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About CLIFF — Free Disability Benefits Help for Georgia Families',
  description:
    'Learn about CLIFF, a free AI-powered platform helping Georgia families of children with disabilities navigate SSI, Medicaid, Katie Beckett waivers, and the benefits cliff at ages 18 and 21.',
  keywords: [
    'about CLIFF',
    'free disability benefits help Georgia',
    'disability family support',
    'AI benefits navigator',
    'Georgia disability nonprofit',
  ],
  alternates: {
    canonical: 'https://cliff.org/about',
  },
  openGraph: {
    title: 'About CLIFF — Free Disability Benefits Help for Georgia Families',
    description:
      'Learn about CLIFF, a free AI-powered platform helping Georgia families navigate disability benefits and the benefits cliff.',
    url: 'https://cliff.org/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
