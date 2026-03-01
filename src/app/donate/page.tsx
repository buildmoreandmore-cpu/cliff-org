'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Button from '@/components/ui/Button'
import AmountSelector from '@/components/donate/AmountSelector'
import TypeToggle from '@/components/donate/TypeToggle'
import ImpactCards from '@/components/donate/ImpactCards'

function DonateContent() {
  const [amount, setAmount] = useState<number | null>(50)
  const [custom, setCustom] = useState('')
  const [type, setType] = useState<'one-time' | 'monthly'>('one-time')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('success') === 'true') setShowSuccess(true)
  }, [searchParams])

  const displayAmount = custom ? `$${custom}` : amount ? `$${amount}` : null

  const handleDonate = async () => {
    const finalAmount = custom ? parseInt(custom) : amount
    if (!finalAmount || finalAmount < 1) return

    setLoading(true)
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, type }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-coral font-medium text-sm tracking-wide uppercase">Support CLIFF</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-navy">
            Help Families Navigate the Cliff
          </h1>
          <p className="mt-4 text-navy/60 leading-relaxed">
            CLIFF is 100% free for families. Your donation directly funds the AI tools that help Georgia families
            navigate disability benefits — from exploring eligibility to drafting appeals to tracking deadlines.
            Every dollar goes toward keeping this service running and reaching more families who need it.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Note:</strong> CLIFF is currently a 501(c)(3) pending organization. While your donation is not yet
            tax-deductible, it directly helps real Georgia families navigate the benefits cliff at ages 18 and 21.
            We will update donors once our tax-exempt status is approved.
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="space-y-6">
              <TypeToggle type={type} onChange={setType} />
              <AmountSelector
                selected={amount}
                onSelect={setAmount}
                custom={custom}
                onCustomChange={setCustom}
              />

              {showSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-4">
                  <strong>Thank you!</strong> Your donation has been received. You&apos;re helping Georgia families navigate the benefits cliff.
                </div>
              )}

              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading || (!amount && !custom)}
                  onClick={handleDonate}
                >
                  {loading
                    ? 'Redirecting to checkout...'
                    : displayAmount
                      ? `Donate ${displayAmount} ${type === 'monthly' ? '/ month' : ''}`
                      : 'Select an Amount'}
                </Button>
                <p className="mt-3 text-xs text-navy/40 text-center">
                  Secure payment processed by Stripe. 501(c)(3) status pending — donations are not yet tax-deductible.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <ImpactCards />
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense>
      <DonateContent />
    </Suspense>
  )
}
