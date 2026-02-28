import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-navy">404</h1>
        <p className="mt-4 text-navy/60">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center px-6 py-3 bg-coral text-white font-medium rounded-lg hover:bg-coral-dark transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
