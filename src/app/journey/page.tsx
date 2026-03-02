'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { EASING } from '@/lib/constants'
import { BookIcon, GlobeIcon, CalendarIcon, HeartIcon } from '@/components/ui/SVGIcons'

interface JourneyMessage {
  role: 'user' | 'assistant'
  content: string
  tools?: { name: string; status: 'running' | 'complete' }[]
}

const TOOL_LABELS: Record<string, string> = {
  research: '🔍 Researching...',
  save_milestone: '💾 Saving to your dashboard...',
}

export default function JourneyPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [messages, setMessages] = useState<JourneyMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login?redirect=/journey')
    }
  }, [user, userLoading, router])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: JourneyMessage = { role: 'user', content }
    const allMessages = [...messages, userMsg]
    setMessages(allMessages)
    setInput('')
    setIsLoading(true)

    const assistantMsg: JourneyMessage = { role: 'assistant', content: '', tools: [] }
    setMessages([...allMessages, assistantMsg])

    try {
      const response = await fetch('/api/agents/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response')

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
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: accumulated }
                  return updated
                })
              } else if (parsed.type === 'tool_call') {
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  updated[updated.length - 1] = {
                    ...last,
                    tools: [...(last.tools || []), { name: parsed.name, status: 'running' }],
                  }
                  return updated
                })
              } else if (parsed.type === 'tool_result') {
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  const tools = (last.tools || []).map((t) =>
                    t.name === parsed.name ? { ...t, status: 'complete' as const } : t
                  )
                  updated[updated.length - 1] = { ...last, tools }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Something went wrong. Please try again.',
        }
        return updated
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, isLoading])

  function handleStart() {
    setStarted(true)
    sendMessage("I want to learn about my child's condition and plan for their future.")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-coral border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Welcome screen */}
        {!started && (
          <motion.div
            className="pt-16 sm:pt-24 pb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASING }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-coral/10 flex items-center justify-center text-coral">
              <BookIcon size={32} />
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy">
              Your Child&apos;s Journey
            </h1>

            <p className="mt-4 text-lg text-navy/60 max-w-xl mx-auto leading-relaxed">
              A personal guide to understanding your child&apos;s condition, what the research says about outcomes, 
              and how to prepare for every stage of life — at your own pace.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              {[
                { Icon: GlobeIcon, text: 'Real statistics and research about your child\'s specific condition' },
                { Icon: CalendarIcon, text: 'Life stage planning from early childhood through adulthood' },
                { Icon: HeartIcon, text: 'Goes at your pace — ask questions, take breaks, come back anytime' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center text-coral flex-shrink-0">
                    <item.Icon size={16} />
                  </div>
                  <p className="text-xs text-navy/60 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg shadow-sm"
              >
                Begin the Journey
              </button>
            </div>

            <p className="mt-4 text-xs text-navy/30">
              CLIFF is not a medical provider. Information is based on published research and is meant to help you plan, not replace professional medical advice.
            </p>
          </motion.div>
        )}

        {/* Chat interface */}
        {started && (
          <div className="pt-6 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-xl font-bold text-navy">Your Child&apos;s Journey</h1>
                <p className="text-xs text-navy/40 mt-0.5">Lifestyle planning powered by CLIFF</p>
              </div>
              <button
                onClick={() => { setMessages([]); setStarted(false) }}
                className="text-xs text-navy/40 hover:text-navy/60 font-medium px-3 py-1.5 border border-gray-200 rounded-lg transition-colors"
              >
                Start Over
              </button>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASING }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-coral text-white rounded-2xl rounded-br-md px-4 py-3'
                        : 'bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm'
                    }`}>
                      {/* Tool indicators */}
                      {msg.tools && msg.tools.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {msg.tools.map((tool, j) => (
                            <div key={j} className={`text-xs px-2 py-1 rounded-md inline-block mr-1 ${
                              tool.status === 'running'
                                ? 'bg-navy/5 text-navy/50 animate-pulse'
                                : 'bg-green-50 text-green-600'
                            }`}>
                              {tool.status === 'running'
                                ? TOOL_LABELS[tool.name] || `Running ${tool.name}...`
                                : `✓ ${tool.name === 'research' ? 'Research complete' : 'Saved'}`}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message content */}
                      {msg.content ? (
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? '' : 'text-navy/80'
                        }`}>
                          {msg.content.split(/(\*\*.*?\*\*)/).map((part, k) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={k} className={msg.role === 'user' ? 'text-white' : 'text-navy'}>{part.slice(2, -2)}</strong>
                            }
                            // Convert URLs to links
                            return part.split(/(https?:\/\/[^\s)]+)/).map((segment, l) => {
                              if (segment.match(/^https?:\/\//)) {
                                return (
                                  <a
                                    key={`${k}-${l}`}
                                    href={segment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`underline ${msg.role === 'user' ? 'text-white/90' : 'text-coral hover:text-coral/80'}`}
                                  >
                                    {segment.length > 50 ? segment.substring(0, 50) + '...' : segment}
                                  </a>
                                )
                              }
                              return <span key={`${k}-${l}`}>{segment}</span>
                            })
                          })}
                        </div>
                      ) : isLoading && i === messages.length - 1 ? (
                        <div className="flex gap-1 py-1">
                          <div className="w-2 h-2 bg-navy/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-navy/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-navy/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3">
              <div className="max-w-3xl mx-auto flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or share what's on your mind..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2.5 bg-coral hover:bg-coral/90 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Send
                </button>
              </div>
              <p className="max-w-3xl mx-auto mt-1.5 text-[10px] text-navy/25 text-center">
                CLIFF shares published research to help you plan. Always consult your child&apos;s medical team for clinical decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
