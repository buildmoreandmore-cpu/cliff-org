'use client'

import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ToolCallIndicator from './ToolCallIndicator'
import EmailDraftCard from './EmailDraftCard'

interface ChatMessageProps {
  message: ChatMessageType
}

const LINK_RE = /(https?:\/\/[^\s)]+)/g
const PHONE_RE = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g

function linkify(text: string, isUser: boolean): (string | JSX.Element)[] {
  const linkClass = isUser
    ? 'underline underline-offset-2'
    : 'text-coral underline underline-offset-2'

  // Combine URL and phone patterns
  const combined = new RegExp(`${LINK_RE.source}|${PHONE_RE.source}`, 'g')
  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const value = match[0]
    if (match[1]) {
      // URL match
      parts.push(
        <a key={match.index} href={value} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {value}
        </a>
      )
    } else {
      // Phone match
      const digits = value.replace(/\D/g, '')
      parts.push(
        <a key={match.index} href={`tel:${digits}`} className={linkClass}>
          {value}
        </a>
      )
    }
    lastIndex = match.index + value.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
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
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {linkify(message.content, isUser)}
          </div>
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
