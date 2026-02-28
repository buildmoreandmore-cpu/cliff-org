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
    <>
      {/* Mobile: horizontal scroll pills */}
      <div className="lg:hidden -mx-5 px-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {resourcePanels.map((panel) => {
            const isActive = panel.id === activeId
            return (
              <button
                key={panel.id}
                onClick={() => onSelect(panel.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-coral text-white'
                    : 'bg-cream text-navy/60 hover:text-navy'
                }`}
              >
                <Icon name={panel.icon} size={14} />
                {panel.title.split(' ').slice(0, 2).join(' ')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden lg:block space-y-1">
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
    </>
  )
}
