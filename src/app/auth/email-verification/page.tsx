'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Sparkles, Zap, Shield, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { formatError } from '@/lib/utils'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailFormData = z.infer<typeof emailSchema>

export default function EmailVerificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),  
  })

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setError('')

    try {
     const otpSet = await authApi.sendOtp({ email: data.email }) as any
      // Store email in sessionStorage for the next step 
      sessionStorage.setItem('verificationEmail', data.email)
      sessionStorage.setItem('otpSet', otpSet.body.otp)
      // Navigate to OTP verification
      router.push('/auth/otp-verification')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Start Your Journey
            <br />
            with Echo Ledger
          </h1>
          <p className="text-xl text-white/90">
            Join thousands of businesses managing their finances intelligently
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              { icon: Zap, text: 'Get started in under 2 minutes' },
              { icon: Shield, text: 'Bank-level security & encryption' },
              { icon: TrendingUp, text: 'AI-powered business insights' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white">
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-white/80 text-sm">
          © 2025 Echo Ledger. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Echo Ledger
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your email to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Sending Code...
                </div>
              ) : (
                'Continue with Email'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
