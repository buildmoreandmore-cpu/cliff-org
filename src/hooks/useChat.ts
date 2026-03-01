'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ChatMessage, NavigatorMode } from '@/lib/types'

function buildAutoMessage(mode: NavigatorMode, program?: string): string {
  if (program) {
    switch (mode) {
      case 'apply':
        return `I need help applying for ${program}. What forms do I need and how do I get started?`
      case 'explore':
        return `I'd like to learn about ${program}. What should my family know?`
      case 'email':
        return `I need to draft a communication about ${program}.`
    }
  }

  // No specific program — send a contextual opener based on mode
  switch (mode) {
    case 'explore':
      return `I want to explore what benefits and programs my family might qualify for. Can you look at my profile and tell me what I should know about?`
    case 'apply':
      return `I need help filling out forms and applications. Based on my profile, what should I be applying for right now? Walk me through the most important one.`
    case 'email':
      return `I need to write to a caseworker or agency. Based on my situation, what's the most important communication I should send right now? Help me draft it.`
  }
}

export function useChat(initialMode?: NavigatorMode, initialProgram?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<NavigatorMode | null>(initialMode ?? null)
  const autoSentRef = useRef(false)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = { role: 'user', content }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode,
          }),
        })

        if (!response.ok) throw new Error('Chat request failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

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
                    if (last.role === 'assistant') {
                      updated[updated.length - 1] = { ...last, content: accumulated }
                    }
                    return updated
                  })
                } else if (parsed.type === 'tool_call') {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last.role === 'assistant') {
                      const toolCalls = last.toolCalls || []
                      updated[updated.length - 1] = {
                        ...last,
                        toolCalls: [
                          ...toolCalls,
                          { name: parsed.name, status: 'running' },
                        ],
                      }
                    }
                    return updated
                  })
                } else if (parsed.type === 'tool_result') {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last.role === 'assistant' && last.toolCalls) {
                      const toolCalls = [...last.toolCalls]
                      const idx = toolCalls.findIndex((t) => t.name === parsed.name)
                      if (idx >= 0) {
                        toolCalls[idx] = { ...toolCalls[idx], status: 'complete' }
                      }
                      updated[updated.length - 1] = { ...last, toolCalls }
                    }
                    return updated
                  })
                } else if (parsed.type === 'email_draft') {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const last = updated[updated.length - 1]
                    if (last.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...last,
                        emailDraft: parsed.draft,
                      }
                    }
                    return updated
                  })
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: 'Sorry, something went wrong. Please try again.',
            }
          }
          return updated
        })
        console.error('Chat error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, mode, isLoading]
  )

  // Auto-send when mode is set (from URL or selection)
  useEffect(() => {
    if (mode && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      sendMessage(buildAutoMessage(mode, initialProgram))
    }
  }, [mode, initialProgram, sendMessage, messages.length])

  const reset = useCallback(() => {
    setMessages([])
    setMode(null)
    autoSentRef.current = false
  }, [])

  return { messages, isLoading, mode, setMode, sendMessage, reset }
}
