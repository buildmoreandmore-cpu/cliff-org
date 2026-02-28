'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { Reminder } from '@/lib/types'
import { BellIcon, CheckIcon } from '@/components/ui/SVGIcons'
import { createClient } from '@/lib/supabase/client'

interface ReminderListProps {
  reminders: Reminder[]
  onUpdate: () => void
}

export default function ReminderList({ reminders, onUpdate }: ReminderListProps) {
  async function toggleComplete(id: string, currentState: boolean) {
    const supabase = createClient()
    const updates: Record<string, unknown> = { is_complete: !currentState }
    if (!currentState) updates.completed_at = new Date().toISOString()
    else updates.completed_at = null
    await supabase.from('reminders').update(updates).eq('id', id)
    onUpdate()
  }

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BellIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Reminders</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No reminders. The Navigator can set deadlines for you.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((reminder) => {
            const isOverdue =
              !reminder.is_complete && new Date(reminder.due_date) < new Date()
            return (
              <div
                key={reminder.id}
                className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
              >
                <button
                  onClick={() => toggleComplete(reminder.id, reminder.is_complete)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    reminder.is_complete
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-coral'
                  }`}
                >
                  {reminder.is_complete && <CheckIcon size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${reminder.is_complete ? 'text-navy/30 line-through' : 'text-navy'}`}
                  >
                    {reminder.title}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-navy/40'}`}
                  >
                    {isOverdue ? 'Overdue: ' : 'Due: '}
                    {new Date(reminder.due_date).toLocaleDateString()}
                  </p>
                  {reminder.category && (
                    <p className="text-xs text-navy/30 mt-0.5">{reminder.category}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
