'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ChatMessageComponent from '@/components/navigator/ChatMessage'
import TypingIndicator from '@/components/navigator/TypingIndicator'
import { SendIcon, SearchIcon, ClipboardIcon, BellIcon, FileIcon, BookIcon, ShieldIcon, HeartIcon, UsersIcon } from '@/components/ui/SVGIcons'
import { EASING } from '@/lib/constants'

const CLIFF_TOOLS = [
  { Icon: SearchIcon, title: 'Navigator', description: 'Ask questions about any Georgia disability program — personalized to your family.', href: '/navigator' },
  { Icon: ClipboardIcon, title: 'My Plan', description: 'A step-by-step action plan with the exact programs, deadlines, and phone numbers for your case.', href: '/plan' },
  { Icon: BookIcon, title: 'Journey', description: 'Understand your child\'s condition, outcomes, and how to prepare for every life stage.', href: '/journey' },
  { Icon: BellIcon, title: 'Proactive Alerts', description: 'Automatic warnings for milestone birthdays, HIPAA transitions, renewals, and policy changes.', href: '/dashboard' },
  { Icon: FileIcon, title: 'Document Intelligence', description: 'Upload denial letters or IEPs — CLIFF extracts deadlines, flags appeals, and recommends next steps.', href: '/dashboard' },
  { Icon: ShieldIcon, title: 'HIPAA Protection', description: 'If a provider violates your rights, CLIFF drafts a complaint letter and tracks the filing deadline.', href: '/navigator' },
  { Icon: HeartIcon, title: 'Advocacy Hub', description: 'Track Georgia disability legislation and send advocacy emails to your representatives.', href: '/advocacy' },
  { Icon: UsersIcon, title: 'Family Advice Board', description: 'Real tips from Georgia parents. Connect privately with families who\'ve been through it.', href: '/community' },
]

export default function IntakePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [intakeComplete, setIntakeComplete] = useState(false)
  const [childName, setChildName] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)
  const questionCount = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) { router.push('/auth/login'); return }
        const data = await res.json()
        if (data?.child_name && data?.diagnosis) {
          router.push('/dashboard')
          return
        }
        setProfileId(data?.id || null)
      } catch { router.push('/auth/login') }
      finally { setCheckingProfile(false) }
    }
    checkProfile()
  }, [router])

  useEffect(() => {
    if (!checkingProfile && profileId && !hasStarted.current) {
      hasStarted.current = true
      setMessages([{
        role: 'assistant',
        content: 'Welcome to CLIFF! 👋\n\nI\'m here to help you navigate Georgia\'s disability benefits system. I\'ll ask a few quick questions to personalize your experience — it only takes a couple minutes.\n\nWhen you\'re ready, just say **hi** to get started!'
      }])
    }
  }, [checkingProfile, profileId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || !profileId) return

    questionCount.current++

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
                setChildName(parsed.data?.child_name || null)
                setIntakeComplete(true)
              }
            } catch {}
          }
        }
      }

      // Safety net: if we've had 16+ exchanges and the model didn't emit intake_complete,
      // check if the profile is now filled and force completion
      if (!intakeComplete && questionCount.current >= 16) {
        try {
          const profileRes = await fetch('/api/profile')
          const profileData = await profileRes.json()
          if (profileData?.child_name && profileData?.diagnosis) {
            setChildName(profileData.child_name)
            setIntakeComplete(true)
          }
        } catch {}
      }
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
  }, [messages, isLoading, profileId, intakeComplete])

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

  // ========== POST-ONBOARDING WELCOME GUIDE ==========
  if (intakeComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream/50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASING }}
            className="text-center mb-10"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy">
              You&apos;re All Set{childName ? `, ${childName.split(' ')[0]}'s Family` : ''}!
            </h1>
            <p className="mt-3 text-navy/60 text-lg max-w-xl mx-auto">
              CLIFF is now personalized to your family. Here&apos;s everything that&apos;s working for you — explore at your own pace.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
          >
            {CLIFF_TOOLS.map((tool) => (
              <motion.a
                key={tool.title}
                href={tool.href}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-coral/30 hover:shadow-sm transition-all group"
                variants={{
                  initial: { opacity: 0, y: 16, scale: 0.97 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.5, ease: EASING }}
                whileHover={{ y: -2 }}
              >
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral flex-shrink-0 group-hover:bg-coral group-hover:text-white transition-colors">
                  <tool.Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-navy">{tool.title}</h3>
                  <p className="mt-0.5 text-xs text-navy/50 leading-relaxed">{tool.description}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-sm text-navy/40 mb-4">
              We recommend starting with your personalized Action Plan
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/plan"
                className="inline-flex items-center justify-center gap-2 bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                View My Action Plan
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-coral/30 text-navy font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ========== INTAKE CHAT ==========
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Welcome to CLIFF</h1>
          <p className="text-sm text-navy/40 mt-1">Let&apos;s get you set up — it only takes a couple minutes.</p>
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
