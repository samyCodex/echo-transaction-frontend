'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, RefreshCw, Sparkles, Shield, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { formatError } from '@/lib/utils'

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits'),
})

type OtpFormData = z.infer<typeof otpSchema>

export default function OtpVerificationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  const otpValue = watch('code')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail')
    const otp  = sessionStorage.getItem('otpSet')
    console.log('🔍 Checking stored email:', storedEmail)

    
    if (!storedEmail) {
      console.log('❌ No email found, redirecting to email verification')
      router.push('/auth/email-verification')
      return
    }
    
    console.log('✅ Email found, setting email state:', storedEmail)
    setEmail(storedEmail)
    setOtp(otp || '' )
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onSubmit = async (data: OtpFormData) => {
    if (!email) return

    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 Verifying OTP:', { email, code: data.code })
      
      const response = await authApi.verifyOtp({
        email,
        code: data.code,
      })

      console.log('📥 OTP Verification Response:', response)
      console.log('📥 Response data:', response.data)
      console.log('📥 Response structure:', JSON.stringify(response, null, 2))

      // The API client returns response with body property
      // So response.body contains { verified: sessionId|null }
      const verifiedValue = response.body?.verified || response.data?.verified
      
      console.log('🔍 Extracted verified value:', verifiedValue)

      // Check if verification was successful (has a sessionId)
      console.log('🔍 Checking verification success...')
      console.log('🔍 verifiedValue type:', typeof verifiedValue)
      console.log('🔍 verifiedValue value:', verifiedValue)
      console.log('🔍 verifiedValue truthy?', !!verifiedValue)
      console.log('🔍 Response statusCode:', response.statusCode)
      
      // Check for successful verification - either 200 status or verified value exists
      if ((response.statusCode === 200 && verifiedValue) || (verifiedValue && verifiedValue !== null)) {
        console.log('✅ OTP Verified successfully, sessionId:', verifiedValue)
        
        // Store session ID for registration
        sessionStorage.setItem('sessionId', String(verifiedValue))
        console.log('✅ SessionId stored in sessionStorage')
        
        // Show redirecting state
        setIsRedirecting(true)
        setError('') // Clear any previous errors
        
        // Get account type and navigate to registration
        const accountType = sessionStorage.getItem('accountType')
        console.log('✅ Retrieved accountType:', accountType)
        
        if (accountType) {
          console.log('✅ Navigating to registration with type:', accountType)
          setTimeout(() => {
            router.push(`/auth/register?type=${accountType}`)
          }, 100)
        } else {
          console.log('⚠️ No account type found, redirecting to account-type selection')
          setTimeout(() => {
            router.push('/auth/account-type')
          }, 100)
        }
      } else {
        console.log('❌ OTP Verification failed')
        console.log('❌ Verified value:', verifiedValue)
        console.log('❌ Response statusCode:', response.statusCode)
        console.log('❌ Full response for debugging:', JSON.stringify(response, null, 2))
        
        // Show error message from backend or default message
        const errorMessage = response.message || 'Invalid or expired OTP. Please try again.'
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error('❌ OTP Verification Error:', err)
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email || countdown > 0) return

    setIsResending(true)
    setError('')

    try {
      await authApi.resendOtp({ email })
      setCountdown(60) // 60 second countdown
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsResending(false)
    }
  }

  // Show loading or redirect message if no email
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Redirecting...</h2>
          <p className="text-gray-600 dark:text-gray-400">Taking you to email verification...</p>
          <Link 
            href="/auth/email-verification"
            className="text-purple-600 hover:text-purple-700 font-semibold inline-block"
          >
            Click here if not redirected
          </Link>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-2">Development Mode:</p>
              <button
                onClick={() => {
                  const testEmail = 'test@example.com'
                  sessionStorage.setItem('verificationEmail', testEmail)
                  setEmail(testEmail)
                  console.log('🧪 Set test email:', testEmail)
                }}
                className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
              >
                Use Test Email
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <Link href="/auth/email-verification" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Check Your Email
          </h1>
          <p className="text-xl text-white/90">
            We've sent a 6-digit verification code to protect your account
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              { icon: Shield, text: 'Secure verification process' },
              { icon: CheckCircle, text: 'Your data is encrypted' },
              { icon: Sparkles, text: 'Almost there!' }
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

      {/* Right Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Echo Ledger
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Enter Verification Code </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">{email}</p>
            <strong className="text-sm text-red-600 flex items-center justify-center gap-1"> WE ARE IN DEV MODE. YOUR OTP IS: {otp} </strong>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center block">
                Verification Code
              </label>
              <Input 
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="text-center text-3xl font-bold tracking-[1rem] h-16 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
                {...register('code')}
                autoFocus
              />
              {errors.code && (
                <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                  <span>⚠️</span> {errors.code.message}
                </p>
              )}
            </div>

            {error && !isRedirecting && (
              <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {isRedirecting && (
              <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="font-semibold">Verification successful! Redirecting...</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all" 
              disabled={isLoading || otpValue?.length !== 6 || isRedirecting}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?
            </p>
            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Resending...
                </div>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link href="/auth/email-verification" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              ← Use different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
