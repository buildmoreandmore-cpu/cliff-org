import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Georgia Disability Legislation & Advocacy Tracker',
  description:
    'Track Georgia disability legislation, contact your representatives, and advocate for disability rights. Stay informed on bills affecting SSI, Medicaid, waivers, and disability services in Georgia.',
  keywords: [
    'Georgia disability legislation',
    'disability advocacy Georgia',
    'Georgia disability bills',
    'disability rights Georgia',
    'contact Georgia representatives disability',
    'Medicaid waiver legislation Georgia',
  ],
  alternates: {
    canonical: 'https://cliff.org/advocacy',
  },
  openGraph: {
    title: 'Georgia Disability Legislation & Advocacy Tracker',
    description:
      'Track Georgia disability legislation and advocate for disability rights. Stay informed on bills affecting SSI, Medicaid, and waivers.',
    url: 'https://cliff.org/advocacy',
  },
}

export default function AdvocacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
