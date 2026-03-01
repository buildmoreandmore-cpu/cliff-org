'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ChatMessageComponent from '@/components/navigator/ChatMessage'
import TypingIndicator from '@/components/navigator/TypingIndicator'
import { SendIcon } from '@/components/ui/SVGIcons'

export default function IntakePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Check if profile is already complete
  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
          router.push('/auth/login')
          return
        }
        const data = await res.json()
        if (data?.child_name) {
          router.push('/dashboard')
          return
        }
        setProfileId(data?.id || null)
      } catch {
        router.push('/auth/login')
      } finally {
        setCheckingProfile(false)
      }
    }
    checkProfile()
  }, [router])

  // Show a static welcome message instead of calling the API
  useEffect(() => {
    if (!checkingProfile && profileId && !hasStarted.current) {
      hasStarted.current = true
      setMessages([{
        role: 'assistant',
        content: 'Welcome to CLIFF! 👋\n\nI\'m here to help you navigate Georgia\'s disability benefits system. I\'ll ask a few quick questions to personalize your experience — it only takes a couple minutes.\n\nWhen you\'re ready, just say **hi** to get started!'
      }])
    }
  }, [checkingProfile, profileId])

  async function processSSE(response: Response, allMessages: ChatMessageType[]) {
    const reader = response.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let accumulated = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'text') {
              accumulated += parsed.content
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: accumulated }
                }
                return updated
              })
            } else if (parsed.type === 'intake_complete') {
              // Redirect after a short delay
              setTimeout(() => router.push('/dashboard'), 3000)
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading || !profileId) return

    const userMessage: ChatMessageType = { role: 'user', content }
    const allMessages = [...messages, userMessage]
    setMessages(allMessages)
    setIsLoading(true)

    const assistantMessage: ChatMessageType = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/agents/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          profileId,
        }),
      })

      if (!response.ok) throw new Error('Request failed')
      await processSSE(response, allMessages)
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: 'Sorry, something went wrong. Please try again.' }
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Welcome to CLIFF</h1>
          <p className="text-sm text-navy/40 mt-1">Let&apos;s get you set up — it only takes a minute.</p>
        </div>

        <div className="bg-off-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col h-[calc(100dvh-11rem)] sm:h-[calc(100dvh-14rem)]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
              {messages.map((msg, i) => (
                <ChatMessageComponent key={i} message={msg} />
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
                placeholder="Type your answer..."
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
        </div>
      </div>
    </div>
  )
}
