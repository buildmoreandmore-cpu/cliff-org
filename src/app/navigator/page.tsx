'use client'

import { useChat } from '@/hooks/useChat'
import ModeSelect from '@/components/navigator/ModeSelect'
import ChatArea from '@/components/navigator/ChatArea'
import Button from '@/components/ui/Button'
import { ArrowRightIcon } from '@/components/ui/SVGIcons'

export default function NavigatorPage() {
  const { messages, isLoading, mode, setMode, sendMessage, reset } = useChat()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">CLIFF Navigator</h1>
            {mode && (
              <p className="text-sm text-navy/40 mt-1">
                Mode: {mode === 'explore' ? 'Explore Benefits' : mode === 'apply' ? 'Form Walk-Through' : 'Draft Communications'}
              </p>
            )}
          </div>
          {mode && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowRightIcon size={14} className="mr-1 rotate-180" />
              Switch Mode
            </Button>
          )}
        </div>

        {!mode ? (
          <ModeSelect onSelect={setMode} />
        ) : (
          <div className="bg-off-white rounded-2xl border border-gray-100 overflow-hidden">
            <ChatArea messages={messages} isLoading={isLoading} onSend={sendMessage} />
          </div>
        )}
      </div>
    </div>
  )
}
