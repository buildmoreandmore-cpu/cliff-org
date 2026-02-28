'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { Application } from '@/lib/types'
import { ClipboardIcon } from '@/components/ui/SVGIcons'

interface ApplicationCardProps {
  applications: Application[]
}

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-purple-100 text-purple-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  appealing: 'bg-orange-100 text-orange-700',
}

export default function ApplicationCard({ applications }: ApplicationCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ClipboardIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Applications</h2>
      </div>

      {applications.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No applications yet. Ask the Navigator to help you get started.
        </p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-navy">{app.program_name}</p>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-500'}`}
                >
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
              {app.denial_reason && (
                <p className="text-xs text-red-500 mt-1">Denial: {app.denial_reason}</p>
              )}
              {app.appeal_deadline && (
                <p className="text-xs text-coral mt-1">Appeal by: {new Date(app.appeal_deadline).toLocaleDateString()}</p>
              )}
              {app.case_number && (
                <p className="text-xs text-navy/40 mt-0.5">Case: {app.case_number}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
