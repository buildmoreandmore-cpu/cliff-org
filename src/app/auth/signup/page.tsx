'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream py-12">
      <AnimatedSection className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-navy">Get Started</h1>
            <p className="mt-2 text-sm text-navy/50">
              Create your free CLIFF account to access the AI Navigator and Dashboard.
            </p>
          </div>
          <SignupForm />
        </div>
      </AnimatedSection>
    </div>
  )
}
