'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/constants'
import { useChat } from '@/hooks/useChat'
import ChatArea from '@/components/navigator/ChatArea'
import { XIcon } from '@/components/ui/SVGIcons'
import type { NavigatorMode } from '@/lib/types'

interface NavigatorDrawerProps {
  open: boolean
  onClose: () => void
  mode: NavigatorMode
  program: string
}

const MODE_LABELS: Record<NavigatorMode, string> = {
  apply: 'Form Walk-Through',
  explore: 'Explore Benefits',
  email: 'Draft Communications',
}

export default function NavigatorDrawer({ open, onClose, mode, program }: NavigatorDrawerProps) {
  const { messages, isLoading, sendMessage } = useChat(
    open ? mode : undefined,
    open ? program : undefined,
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-[550px] bg-white shadow-xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: EASING as unknown as number[] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <p className="text-xs font-medium text-coral">{MODE_LABELS[mode]}</p>
                <h2 className="font-display text-sm font-semibold text-navy truncate">{program}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-navy/40 hover:text-navy rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-hidden bg-off-white">
              <ChatArea
                messages={messages}
                isLoading={isLoading}
                onSend={sendMessage}
                className="flex flex-col h-full"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
