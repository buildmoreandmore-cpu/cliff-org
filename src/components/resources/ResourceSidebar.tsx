'use client'

import { motion } from 'framer-motion'
import { resourcePanels } from '@/data/resources'
import { Icon } from '@/components/ui/SVGIcons'

interface ResourceSidebarProps {
  activeId: string
  onSelect: (id: string) => void
}

export default function ResourceSidebar({ activeId, onSelect }: ResourceSidebarProps) {
  return (
    <nav className="space-y-1">
      {resourcePanels.map((panel) => {
        const isActive = panel.id === activeId
        return (
          <button
            key={panel.id}
            onClick={() => onSelect(panel.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-colors ${
              isActive
                ? 'bg-coral/10 text-coral font-medium'
                : 'text-navy/60 hover:text-navy hover:bg-cream'
            }`}
          >
            <Icon name={panel.icon} size={18} />
            <span className="truncate">{panel.title}</span>
            {isActive && (
              <motion.div
                className="ml-auto w-1.5 h-1.5 rounded-full bg-coral"
                layoutId="sidebar-dot"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
