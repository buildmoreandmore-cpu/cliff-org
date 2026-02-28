'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ChildBenefit } from '@/lib/types'
import { ShieldIcon } from '@/components/ui/SVGIcons'

interface BenefitTrackerProps {
  benefits: ChildBenefit[]
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  denied: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
  ending_soon: 'bg-orange-100 text-orange-700',
}

export default function BenefitTracker({ benefits }: BenefitTrackerProps) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldIcon size={18} className="text-coral" />
        <h2 className="font-display text-lg font-semibold text-navy">Benefit Tracker</h2>
      </div>

      {benefits.length === 0 ? (
        <p className="text-sm text-navy/40 py-4">
          No benefits tracked yet. Use the Navigator to add benefits.
        </p>
      ) : (
        <div className="space-y-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-navy">{benefit.benefit_name}</p>
                {benefit.notes && (
                  <p className="text-xs text-navy/40 mt-0.5">{benefit.notes}</p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[benefit.status] || 'bg-gray-100 text-gray-500'}`}
              >
                {benefit.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
