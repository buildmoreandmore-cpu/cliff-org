'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PUBLIC_NAV_LINKS, PRIVATE_NAV_LINKS } from '@/lib/constants'
import { MenuIcon, BellIcon } from '@/components/ui/SVGIcons'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase.from('profiles').select('id').eq('user_id', user.id).single().then(({ data: prof }) => {
      if (!prof) return
      supabase.from('notifications').select('id', { count: 'exact', head: true })
        .eq('profile_id', prof.id).is('opened_at', null)
        .then(({ count }) => setUnreadCount(count || 0))
    })
  }, [user])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-navy">CLIFF</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {loading ? null : (user ? [...PRIVATE_NAV_LINKS, { label: 'Resources', href: '/resources' }] : PUBLIC_NAV_LINKS).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-navy/70 hover:text-coral transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="w-20 h-8" />
              ) : user ? (
                <>
                  <Link href="/dashboard#inbox" className="relative p-2 text-navy/70 hover:text-coral transition-colors">
                    <BellIcon size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 text-navy/70 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-navy/70 hover:text-coral transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-4 py-2 bg-coral text-white text-sm font-medium rounded-lg hover:bg-coral-dark transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 text-navy"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} user={user} onSignOut={handleSignOut} unreadCount={unreadCount} />
    </>
  )
}
