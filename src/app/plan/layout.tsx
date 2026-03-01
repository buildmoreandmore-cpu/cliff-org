import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Action Plan | CLIFF',
  description: 'Your personalized, step-by-step action plan for navigating disability benefits in Georgia.',
  robots: { index: false, follow: false },
}

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
