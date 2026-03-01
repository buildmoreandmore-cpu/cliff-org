'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'

interface Goal {
  id: number
  amount: number
  label: string
  description: string
}

interface CurrentGoal extends Goal {
  raised_toward_goal: number
  percent: number
}

interface ProgressData {
  total_raised: number
  donor_count: number
  current_goal: CurrentGoal | null
  all_goals_complete: boolean
  completed_goals: number[]
  goals: Goal[]
}

export default function GoalTracker() {
  const [data, setData] = useState<ProgressData | null>(null)

  useEffect(() => {
    fetch('/api/donate/progress')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
        <div className="h-6 bg-gray-100 rounded mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    )
  }

  const { current_goal, completed_goals, goals, total_raised, donor_count, all_goals_complete } = data

  return (
    <motion.div
      className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASING }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold text-navy">Funding Goals</h3>
          {donor_count > 0 && (
            <span className="text-xs text-navy/40 font-medium">
              {donor_count} {donor_count === 1 ? 'donor' : 'donors'}
            </span>
          )}
        </div>
        <p className="text-sm text-navy/50">
          Every dollar keeps CLIFF running for Georgia families. See exactly what your donation funds.
        </p>
      </div>

      {/* Current goal spotlight */}
      {current_goal && !all_goals_complete && (
        <div className="px-6 pb-5">
          <div className="bg-coral/[0.04] border border-coral/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-coral uppercase tracking-wider">
                  Current Goal
                </span>
                <h4 className="font-display text-base font-semibold text-navy mt-0.5">
                  {current_goal.label}
                </h4>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-navy">
                  ${current_goal.raised_toward_goal}
                  <span className="text-navy/30 text-sm font-normal"> / ${current_goal.amount}</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-navy/60 mb-3">{current_goal.description}</p>

            {/* Progress bar */}
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-coral to-coral/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${current_goal.percent}%` }}
                transition={{ duration: 1.2, ease: EASING, delay: 0.3 }}
              />
              {current_goal.percent > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                  {current_goal.percent}%
                </span>
              )}
            </div>

            {current_goal.percent >= 75 && current_goal.percent < 100 && (
              <p className="mt-2 text-xs text-coral font-medium text-center">
                🔥 Almost there! ${current_goal.amount - current_goal.raised_toward_goal} to go
              </p>
            )}
          </div>
        </div>
      )}

      {all_goals_complete && (
        <div className="px-6 pb-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <h4 className="font-display font-semibold text-green-800">All Goals Funded!</h4>
            <p className="text-sm text-green-700 mt-1">
              ${total_raised} raised — CLIFF is fully funded this month. Additional donations help us grow.
            </p>
          </div>
        </div>
      )}

      {/* Goal roadmap */}
      <div className="border-t border-gray-50 px-6 py-4">
        <p className="text-xs font-medium text-navy/40 uppercase tracking-wider mb-3">Roadmap</p>
        <div className="space-y-2.5">
          {goals.map((goal, i) => {
            const isCompleted = completed_goals.includes(goal.id)
            const isCurrent = current_goal?.id === goal.id
            return (
              <div
                key={goal.id}
                className={`flex items-center gap-3 ${isCurrent ? '' : 'opacity-70'}`}
              >
                {/* Status icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : isCurrent
                      ? 'bg-coral/10 text-coral border-2 border-coral/30'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-700 line-through' : isCurrent ? 'text-navy' : 'text-navy/50'
                  }`}>
                    {goal.label}
                  </p>
                </div>

                {/* Amount */}
                <span className={`text-xs font-medium flex-shrink-0 ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-coral' : 'text-navy/30'
                }`}>
                  {isCompleted ? '✓ Funded' : `$${goal.amount}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total raised footer */}
      <div className="border-t border-gray-50 px-6 py-3 bg-cream/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-navy/40">Total raised</span>
          <span className="font-display text-sm font-bold text-navy">${total_raised}</span>
        </div>
      </div>
    </motion.div>
  )
}
