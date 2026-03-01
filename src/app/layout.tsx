import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cliff.org'),
  title: {
    default: 'CLIFF — Free Benefits Cliff Navigator for Georgia Disability Families',
    template: '%s | CLIFF',
  },
  description:
    'Free AI-powered navigator helping Georgia families of children with disabilities prepare for the benefits cliff at ages 18 and 21. Guidance on SSI, Medicaid, Katie Beckett, NOW & COMP waivers, and more.',
  keywords: [
    'benefits cliff',
    'Georgia disability benefits',
    'SSI transition age 18',
    'Katie Beckett waiver Georgia',
    'DBHDD',
    'special needs planning Georgia',
    'Medicaid waiver Georgia',
    'NOW waiver Georgia',
    'COMP waiver Georgia',
    'disability benefits navigator',
    'SSI for adults with disabilities',
    'Georgia Medicaid disability',
    'disability transition planning',
    'age 18 benefits cliff',
    'age 21 benefits cliff',
    'STABLE account Georgia',
    'special needs trust Georgia',
    'Georgia disability advocacy',
    'disability family support Georgia',
    'EPSDT Georgia',
    'guardianship disability Georgia',
    'DBHDD planning list',
    'free disability help Georgia',
    'AI disability benefits guide',
    'SOURCE waiver Georgia',
  ],
  authors: [{ name: 'CLIFF' }],
  creator: 'CLIFF',
  publisher: 'CLIFF',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://cliff.org',
  },
  openGraph: {
    title: 'CLIFF — Free Benefits Cliff Navigator for Georgia Disability Families',
    description:
      'Free AI navigator for Georgia families preparing for the disability benefits cliff. SSI, Medicaid, waivers, and transition planning guidance.',
    type: 'website',
    url: 'https://cliff.org',
    siteName: 'CLIFF',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLIFF — Free Benefits Cliff Navigator for Georgia Disability Families',
    description:
      'Free AI navigator for Georgia families preparing for the disability benefits cliff.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-body bg-white text-navy min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
