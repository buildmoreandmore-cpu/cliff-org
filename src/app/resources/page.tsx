'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { resourcePanels } from '@/data/resources'
import ResourceSidebar from '@/components/resources/ResourceSidebar'
import ResourcePanel from '@/components/resources/ResourcePanel'

export default function ResourcesPage() {
  const [activeId, setActiveId] = useState(resourcePanels[0].id)
  const activePanel = resourcePanels.find((p) => p.id === activeId) || resourcePanels[0]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Resource Library</p>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold text-navy">
            Georgia Disability Benefits Guide
          </h1>
          <p className="mt-4 text-navy/60 leading-relaxed">
            Everything you need to know about benefits, waivers, transitions, and planning for your
            child with a disability in Georgia.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24">
              <ResourceSidebar activeId={activeId} onSelect={setActiveId} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <ResourcePanel panel={activePanel} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
