import Link from 'next/link'
import { externalLinks } from '@/data/external-links'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <span className="font-display text-2xl font-bold text-white">CLIFF</span>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              AI-powered navigator helping Georgia families prepare for the benefits cliff at ages 18 and 21.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigate
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Resources', href: '/resources' },
                { label: 'Navigator', href: '/navigator' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Donate', href: '/donate' },
                { label: 'About', href: '/about' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-coral transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Georgia Resources
            </h3>
            <ul className="space-y-2">
              {externalLinks.slice(0, 6).map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-coral transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">
              More Resources
            </h3>
            <ul className="space-y-2">
              {externalLinks.slice(6).map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-coral transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            CLIFF is a nonprofit organization. This tool provides general information, not legal or medical advice.
            Always consult qualified professionals for your specific situation.
          </p>
          <p className="mt-2 text-xs text-white/30">
            &copy; {new Date().getFullYear()} CLIFF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
