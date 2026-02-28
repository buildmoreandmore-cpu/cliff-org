'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ToolCallIndicator from './ToolCallIndicator'
import EmailDraftCard from './EmailDraftCard'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: EASING }}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-coral text-white rounded-2xl rounded-br-md'
            : 'bg-cream text-navy rounded-2xl rounded-bl-md'
        } px-5 py-3`}
      >
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.toolCalls.map((tc, i) => (
              <ToolCallIndicator key={i} name={tc.name} status={tc.status} />
            ))}
          </div>
        )}

        {message.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        )}

        {message.emailDraft && (
          <div className="mt-3">
            <EmailDraftCard draft={message.emailDraft} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
