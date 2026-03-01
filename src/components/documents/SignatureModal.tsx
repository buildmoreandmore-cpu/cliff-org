'use client'

import { useState, useRef, useEffect } from 'react'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSign: (signatureData: string) => void
  documentTitle: string
}

export default function SignatureModal({ isOpen, onClose, onSign, documentTitle }: SignatureModalProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('type')
  const [typedName, setTypedName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current && mode === 'draw') {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#1a1a2e'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setIsDrawing(true)
    setHasDrawn(true)
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function stopDraw() {
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  function handleSign() {
    if (mode === 'type') {
      if (!typedName.trim()) return
      onSign(`typed:${typedName.trim()}`)
    } else {
      if (!hasDrawn) return
      const canvas = canvasRef.current!
      onSign(canvas.toDataURL('image/png'))
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <h3 className="font-display text-xl font-semibold text-navy">Sign Document</h3>
        <p className="mt-1 text-sm text-navy/60">
          Sign &quot;{documentTitle}&quot; to mark it ready for submission.
        </p>

        {/* Mode toggle */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode('type')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'type' ? 'bg-coral text-white' : 'bg-gray-100 text-navy/60 hover:bg-gray-200'
            }`}
          >
            Type Name
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'draw' ? 'bg-coral text-white' : 'bg-gray-100 text-navy/60 hover:bg-gray-200'
            }`}
          >
            Draw Signature
          </button>
        </div>

        {/* Signature input */}
        <div className="mt-4">
          {mode === 'type' ? (
            <div>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-coral/30 text-lg"
              />
              {typedName && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl text-center">
                  <p className="font-serif text-2xl italic text-navy">{typedName}</p>
                  <p className="mt-1 text-xs text-navy/40">Electronic signature</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <canvas
                ref={canvasRef}
                width={440}
                height={150}
                className="w-full border border-gray-200 rounded-xl cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <button
                onClick={clearCanvas}
                className="mt-2 text-sm text-navy/50 hover:text-navy/70 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-navy/40">
          By signing, you confirm this document is accurate to the best of your knowledge. 
          This is an electronic signature under the E-SIGN Act.
        </p>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-navy/60 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={mode === 'type' ? !typedName.trim() : !hasDrawn}
            className="flex-1 py-2.5 px-4 bg-coral hover:bg-coral/90 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sign & Continue
          </button>
        </div>
      </div>
    </div>
  )
}
