'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASING } from '@/lib/constants'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ToolCallIndicator from './ToolCallIndicator'
import EmailDraftCard from './EmailDraftCard'
import { AlertIcon } from '@/components/ui/SVGIcons'

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

function FlagButton({ messageContent }: { messageContent: string }) {
  const [state, setState] = useState<'idle' | 'form' | 'sending' | 'done'>('idle')
  const [reason, setReason] = useState('')

  async function submit() {
    if (!reason.trim()) return
    setState('sending')
    try {
      await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: 'correction',
          description: `[Flagged AI Response]\n\nReason: ${reason.trim()}\n\nOriginal response:\n${messageContent.slice(0, 500)}`,
          source_heard_from: 'user_flag',
          related_content_block: null,
          submitted_by: null,
        }),
      })
      setState('done')
    } catch {
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <span className="text-[10px] text-green-600">
        Flagged — thank you
      </span>
    )
  }

  if (state === 'form') {
    return (
      <div className="mt-2 space-y-1.5">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="What seems wrong? (wrong number, outdated info, bad advice...)"
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-navy placeholder:text-navy/30 focus:outline-none focus:ring-1 focus:ring-coral/30 resize-none"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            onClick={submit}
            disabled={!reason.trim()}
            className="text-[10px] font-medium px-2 py-1 bg-coral text-white rounded-md hover:bg-coral-dark disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
          <button onClick={() => { setState('idle'); setReason('') }} className="text-[10px] text-navy/40 hover:text-navy">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('form')}
      className="flex items-center gap-1 text-[10px] text-navy/30 hover:text-coral transition-colors mt-1"
      title="Flag inaccurate information"
    >
      <AlertIcon size={10} />
      <span>Something wrong?</span>
    </button>
  )
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
      <div className="max-w-[85%]">
        <div
          className={`${
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

        {/* Flag button for assistant messages with actual content */}
        {!isUser && message.content && message.content.length > 20 && (
          <FlagButton messageContent={message.content} />
        )}
      </div>
    </motion.div>
  )
}
