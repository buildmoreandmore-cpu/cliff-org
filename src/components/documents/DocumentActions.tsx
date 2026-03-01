'use client'

import { useState } from 'react'
import SignatureModal from './SignatureModal'

interface DocumentActionsProps {
  documentId: string
  title: string
  submissionStatus: string
  filingUrl?: string | null
  recipientEmail?: string | null
  recipientAgency?: string | null
  signedAt?: string | null
  submissionDeadline?: string | null
  snoozedUntil?: string | null
  onStatusChange: (newStatus: string) => void
}

export default function DocumentActions({
  documentId,
  title,
  submissionStatus,
  filingUrl,
  recipientEmail,
  signedAt,
  submissionDeadline,
  onStatusChange,
}: DocumentActionsProps) {
  const [showSignModal, setShowSignModal] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function callAction(action: string, extra: Record<string, unknown> = {}) {
    setLoading(action)
    try {
      const res = await fetch('/api/documents/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, action, ...extra }),
      })
      const data = await res.json()
      if (data.success) {
        if (action === 'sign') {
          onStatusChange('ready')
          showToast('✅ Signed! Ready to submit.')
        } else if (action === 'submit') {
          onStatusChange('submitted')
          showToast('✅ Marked as submitted.')
        } else if (action === 'send_email') {
          onStatusChange('submitted')
          showToast(`✅ Sent to ${data.sent_to}`)
        } else if (action === 'snooze') {
          showToast('😴 Snoozed. We\'ll remind you later.')
        }
      } else {
        showToast(`❌ ${data.error || 'Something went wrong'}`)
      }
    } catch {
      showToast('❌ Failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleSign(signatureData: string) {
    await callAction('sign', { signature_data: signatureData })
  }

  const deadlineDays = submissionDeadline
    ? Math.ceil((new Date(submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-navy text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <SignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSign={handleSign}
        documentTitle={title}
      />

      <div className="mt-3 space-y-2">
        {/* Deadline warning */}
        {deadlineDays !== null && deadlineDays > 0 && deadlineDays <= 14 && (
          <div className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
            deadlineDays <= 3 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
          }`}>
            ⏰ {deadlineDays} days left to submit
          </div>
        )}

        {/* Status-based actions */}
        <div className="flex flex-wrap gap-2">
          {/* Draft → Sign */}
          {submissionStatus === 'draft' && (
            <button
              onClick={() => setShowSignModal(true)}
              disabled={loading === 'sign'}
              className="inline-flex items-center gap-1.5 text-xs bg-coral hover:bg-coral/90 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              ✍️ {loading === 'sign' ? 'Signing...' : 'Sign Document'}
            </button>
          )}

          {/* Ready → Submit options */}
          {submissionStatus === 'ready' && (
            <>
              {recipientEmail && (
                <button
                  onClick={() => callAction('send_email')}
                  disabled={loading === 'send_email'}
                  className="inline-flex items-center gap-1.5 text-xs bg-coral hover:bg-coral/90 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  📧 {loading === 'send_email' ? 'Sending...' : 'Email to Agency'}
                </button>
              )}

              {filingUrl && (
                <a
                  href={filingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-navy/10 hover:bg-navy/20 text-navy px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  🌐 File Online
                </a>
              )}

              <button
                onClick={() => callAction('submit')}
                disabled={loading === 'submit'}
                className="inline-flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                ✅ {loading === 'submit' ? 'Saving...' : 'I Filed It Myself'}
              </button>
            </>
          )}

          {/* Snooze (for draft or ready) */}
          {(submissionStatus === 'draft' || submissionStatus === 'ready') && (
            <button
              onClick={() => callAction('snooze', { snooze_days: 3 })}
              disabled={loading === 'snooze'}
              className="inline-flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-navy/60 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              😴 {loading === 'snooze' ? '...' : 'Life Got Busy — Remind Me Later'}
            </button>
          )}

          {/* Submitted badge */}
          {submissionStatus === 'submitted' && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg font-medium">
              ✅ Submitted {signedAt ? `· Signed ${new Date(signedAt).toLocaleDateString()}` : ''}
            </span>
          )}

          {/* Expired badge */}
          {submissionStatus === 'expired' && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-2 rounded-lg font-medium">
              ⚠️ Deadline passed — contact agency about late submission
            </span>
          )}
        </div>
      </div>
    </>
  )
}
