'use client'

import { motion } from 'framer-motion'

interface AmountSelectorProps {
  selected: number | null
  onSelect: (amount: number | null) => void
  custom: string
  onCustomChange: (value: string) => void
}

const amounts = [10, 25, 50, 100, 250, 500]

export default function AmountSelector({
  selected,
  onSelect,
  custom,
  onCustomChange,
}: AmountSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {amounts.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => {
              onSelect(amount)
              onCustomChange('')
            }}
            className={`py-2.5 sm:py-3 rounded-lg text-center text-sm sm:text-base font-medium transition-colors ${
              selected === amount
                ? 'bg-coral text-white'
                : 'bg-cream text-navy hover:bg-coral/10'
            }`}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            ${amount}
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40 font-medium">$</span>
        <input
          type="number"
          placeholder="Custom amount"
          value={custom}
          onChange={(e) => {
            onCustomChange(e.target.value)
            onSelect(null)
          }}
          className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
        />
      </div>
    </div>
  )
}
