'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { BellIcon, CheckIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'

interface NotificationInboxProps {
  notifications: Notification[]
  onUpdate: () => void
}

const triggerColors: Record<string, string> = {
  breaking_news: 'bg-red-100 text-red-700',
  milestone_check: 'bg-orange-100 text-orange-700',
  content_change: 'bg-blue-100 text-blue-700',
  content_integrity: 'bg-purple-100 text-purple-700',
  weekly_digest: 'bg-green-100 text-green-700',
}

const triggerLabels: Record<string, string> = {
  breaking_news: 'Breaking News',
  milestone_check: 'Milestone',
  content_change: 'Policy Update',
  content_integrity: 'Integrity Check',
  weekly_digest: 'Weekly Digest',
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function NotificationInbox({ notifications, onUpdate }: NotificationInboxProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const unreadCount = notifications.filter((n) => !n.opened_at).length

  async function markRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ opened_at: new Date().toISOString() }).eq('id', id)
    onUpdate()
  }

  async function markAllRead() {
    const supabase = createClient()
    const unreadIds = notifications.filter((n) => !n.opened_at).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ opened_at: new Date().toISOString() }).in('id', unreadIds)
    onUpdate()
  }

  function handleClick(n: Notification) {
    setExpandedId(expandedId === n.id ? null : n.id)
    if (!n.opened_at) markRead(n.id)
  }

  return (
    <motion.div
      id="inbox"
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.05 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellIcon size={18} className="text-coral" />
          <h2 className="font-display text-lg font-semibold text-navy">Notifications</h2>
          {unreadCount > 0 && (
            <span className="ml-1 bg-coral text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-coral hover:text-coral-dark font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No notifications yet. We&apos;ll send you updates about policy changes, approaching deadlines, and important news.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="border border-gray-50 rounded-lg p-3 cursor-pointer hover:bg-cream/50 transition-colors"
              onClick={() => handleClick(n)}
            >
              <div className="flex items-start gap-2.5">
                {!n.opened_at && (
                  <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-coral shrink-0" />
                )}
                <div className={`flex-1 min-w-0 ${n.opened_at ? 'ml-5' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${n.opened_at ? 'text-navy/70' : 'text-navy font-semibold'}`}>
                      {n.subject}
                    </p>
                    <span className="text-xs text-navy/30 whitespace-nowrap shrink-0">
                      {relativeTime(n.sent_at || n.id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${triggerColors[n.trigger_type] || 'bg-gray-100 text-gray-500'}`}>
                      {triggerLabels[n.trigger_type] || n.trigger_type}
                    </span>
                  </div>
                  <AnimatePresence>
                    {expandedId === n.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-navy/60 mt-2 whitespace-pre-wrap">{n.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
