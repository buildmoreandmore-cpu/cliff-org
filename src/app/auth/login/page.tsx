'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream">
      <AnimatedSection className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-navy">Welcome Back</h1>
            <p className="mt-2 text-sm text-navy/50">Sign in to access your Navigator and Dashboard.</p>
          </div>
          <LoginForm />
        </div>
      </AnimatedSection>
    </div>
  )
}
