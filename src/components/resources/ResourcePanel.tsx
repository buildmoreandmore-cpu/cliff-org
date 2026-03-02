'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { ExternalLinkIcon, AlertIcon } from '@/components/ui/SVGIcons'
import FlagButton from '@/components/community/FlagButton'
import type { ResourcePanel as ResourcePanelType } from '@/data/resources'

interface ResourcePanelProps {
  panel: ResourcePanelType
}

export default function ResourcePanel({ panel }: ResourcePanelProps) {
  return (
    <motion.div
      key={panel.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASING }}
      className="relative"
    >
      <h2 className="font-display text-2xl font-bold text-navy">{panel.title}</h2>
      <p className="mt-2 text-navy/60">{panel.summary}</p>

      {panel.alertText && (
        <div className="mt-6 flex gap-3 p-4 bg-coral/5 border border-coral/20 rounded-lg">
          <AlertIcon className="text-coral shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-navy/80 leading-relaxed">{panel.alertText}</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {panel.content.map((paragraph, i) => (
          <p key={i} className="text-sm text-navy/70 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="absolute top-4 right-4">
        <FlagButton contentBlockSlug={panel.id} />
      </div>

      {panel.links.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-3">
            Official Links & Applications
          </h3>
          <div className="space-y-2">
            {panel.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-coral hover:text-coral-dark transition-colors"
              >
                <ExternalLinkIcon size={14} />
                {link.label}
              </a>
            ))}
          </div>

          {panel.applyUrl && (
            <a
              href={panel.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-coral text-white text-sm font-semibold rounded-lg hover:bg-coral/90 transition-colors"
            >
              <ExternalLinkIcon size={14} />
              {panel.applyLabel || 'Start Application'}
            </a>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-navy/40 mb-2">Need help with this program?</p>
            <a
              href={`/navigator?mode=apply&program=${encodeURIComponent(panel.title)}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-coral hover:text-coral-dark transition-colors"
            >
              Get step-by-step help from CLIFF →
            </a>
          </div>
        </div>
      )}
    </motion.div>
  )
}
