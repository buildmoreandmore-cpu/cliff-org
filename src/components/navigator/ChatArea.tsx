'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { SendIcon } from '@/components/ui/SVGIcons'

interface ChatAreaProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSend: (content: string) => void
}

export default function ChatArea({ messages, isLoading, onSend }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy/30 text-sm">
              Ask me anything about Georgia disability benefits, forms, or transitions.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-coral text-white rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  )
}
