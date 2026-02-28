'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS, EASING } from '@/lib/constants'
import { XIcon, BellIcon } from '@/components/ui/SVGIcons'
import type { User } from '@supabase/supabase-js'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  user: User | null
  onSignOut: () => void
  unreadCount?: number
}

export default function MobileMenu({ open, onClose, user, onSignOut, unreadCount = 0 }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: EASING }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-display text-xl font-bold text-navy">CLIFF</span>
              <button onClick={onClose} className="p-2 text-navy" aria-label="Close menu">
                <XIcon size={24} />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="px-4 py-3 text-navy/80 hover:text-coral hover:bg-cream rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-gray-100" />
              {user ? (
                <>
                  <Link
                    href="/dashboard#inbox"
                    onClick={onClose}
                    className="px-4 py-3 text-navy/80 hover:text-coral hover:bg-cream rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2"><BellIcon size={16} /> Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="px-4 py-3 text-navy/80 hover:text-coral hover:bg-cream rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { onSignOut(); onClose() }}
                    className="mt-2 px-4 py-3 border border-gray-200 text-navy/70 text-center rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="px-4 py-3 text-navy/80 hover:text-coral hover:bg-cream rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={onClose}
                    className="mt-2 px-4 py-3 bg-coral text-white text-center rounded-lg hover:bg-coral-dark transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
