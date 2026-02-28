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
  title: 'CLIFF — Navigate the Benefits Cliff for Georgia Families',
  description:
    'AI-powered navigator helping Georgia families of children with disabilities prepare for the benefits cliff at ages 18 and 21. Free guidance on SSI, Medicaid, waivers, and more.',
  keywords: [
    'benefits cliff',
    'Georgia disability',
    'SSI transition',
    'Katie Beckett',
    'DBHDD',
    'special needs planning',
    'Medicaid waiver',
  ],
  openGraph: {
    title: 'CLIFF — Navigate the Benefits Cliff',
    description:
      'Free AI navigator for Georgia families preparing for the disability benefits cliff.',
    type: 'website',
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
