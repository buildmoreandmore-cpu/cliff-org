'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import { SendIcon, FileIcon } from '@/components/ui/SVGIcons'

interface ChatAreaProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSend: (content: string) => void
  className?: string
}

export default function ChatArea({ messages, isLoading, onSend, className }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; text: string } | null>(null)
  const [docType, setDocType] = useState<string>('')
  const [analyzingDoc, setAnalyzingDoc] = useState(false)
  const [docAnalysis, setDocAnalysis] = useState<{ analysis: Record<string, unknown> } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const data = await res.json()
      setUploadedFile({ name: file.name, text: data.extractedText })
      setDocType('')
      setDocAnalysis(null)
    } catch (err) {
      console.error('Upload error:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLoading || uploading) return

    let messageText = input.trim()

    if (uploadedFile) {
      const prefix = `[Uploaded form: ${uploadedFile.name}]\n\nExtracted content:\n${uploadedFile.text}\n\n`
      messageText = prefix + (messageText || 'Please help me with this form.')
      setUploadedFile(null)
    }

    if (!messageText) return
    onSend(messageText)
    setInput('')
  }

  async function analyzeDocument() {
    if (!uploadedFile || !docType) return
    setAnalyzingDoc(true)
    try {
      const profileRes = await fetch('/api/profile')
      const profileData = await profileRes.json()
      const profileId = profileData.profile?.id

      if (!profileId) {
        alert('Please complete your profile first.')
        return
      }

      const res = await fetch('/api/agents/document-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          documentText: uploadedFile.text,
          documentType: docType,
          filename: uploadedFile.name,
        }),
      })

      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setDocAnalysis(data)

      // Send the analysis summary to the chat
      const summary = data.analysis?.summary || 'Document analyzed successfully.'
      onSend(`[Document Analysis: ${uploadedFile.name}]\n\n${summary}\n\nFull analysis has been saved to your dashboard.`)
      setUploadedFile(null)
      setDocType('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Document analysis error:', err)
      alert('Failed to analyze document. You can still send it as a regular upload.')
    } finally {
      setAnalyzingDoc(false)
    }
  }

  function removeUpload() {
    setUploadedFile(null)
    setDocType('')
    setDocAnalysis(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className={className ?? "flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]"}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy/30 text-sm">
              Ask me anything about Georgia disability benefits, forms, or transitions.
            </p>
            <p className="text-navy/20 text-xs mt-2">
              You can also upload a form using the 📎 button below.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
      </div>

      {/* Upload preview with document type selector */}
      {uploadedFile && (
        <div className="mx-3 sm:mx-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileIcon size={16} className="text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-800 truncate">{uploadedFile.name}</span>
            </div>
            <button
              onClick={removeUpload}
              className="text-blue-400 hover:text-blue-600 text-xs font-medium flex-shrink-0 ml-2"
            >
              Remove
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-blue-200 bg-white text-navy focus:outline-none focus:ring-1 focus:ring-coral/30"
            >
              <option value="">What type of document is this?</option>
              <option value="denial_letter">Denial Letter</option>
              <option value="iep">IEP</option>
              <option value="waiver_determination">Waiver Determination</option>
              <option value="medical_record">Medical Record</option>
              <option value="other">Other Form</option>
            </select>
            {docType && (
              <button
                onClick={analyzeDocument}
                disabled={analyzingDoc}
                className="text-xs px-3 py-1.5 bg-coral text-white rounded-lg hover:bg-coral-dark transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {analyzingDoc ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <div className="mx-3 sm:mx-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-navy/50">Reading form...</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || uploading}
          className="p-3 text-navy/40 hover:text-coral rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Upload a form"
        >
          <FileIcon size={18} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={uploadedFile ? 'Ask about this form, or just send...' : 'Type your question...'}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          disabled={isLoading || uploading}
        />
        <button
          type="submit"
          disabled={isLoading || uploading || (!input.trim() && !uploadedFile)}
          className="p-3 bg-coral text-white rounded-xl hover:bg-coral-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  )
}
