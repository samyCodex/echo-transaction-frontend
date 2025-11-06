'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Eye, EyeOff, ArrowLeft, Sparkles, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { formatError } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await authApi.login(data) 
      
      // Handle response structure (backend uses body property)
      const responseData = response.body || response.data as any
      console.log('📥 Login Response:', response)
      console.log('📥 Response Data:', responseData)
      
      if (!responseData || !responseData.accessToken) {
        throw new Error('Invalid response: missing accessToken')
      }
      
      // Store auth data
      console.log('💾 Storing auth data...')
      console.log('💾 Access token:', responseData.accessToken)
      console.log('💾 Full response data:', responseData)
      
      localStorage.setItem('accessToken', responseData.accessToken)
      const { accessToken, ...user } = responseData
      
      // Fix user type field - backend returns role_name instead of type
      if (user.role_name && !user.type) {
        user.type = user.role_name
        console.log('🔧 Fixed user type field:', user.type)
      }
      
      // Additional check to ensure type is set correctly
      if (!user.type && user.role_name) {
        user.type = user.role_name
        console.log('🔧 Fallback: Set user type from role_name:', user.type)
      }
      
      console.log('🔍 Final user object before storage:', user)
      
      console.log('💾 User data to store:', user)
      localStorage.setItem('user', JSON.stringify(user))
      
      console.log('✅ Auth data stored successfully')
      console.log('✅ Stored token:', localStorage.getItem('accessToken'))
      console.log('✅ Stored user:', localStorage.getItem('user'))

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
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
            Welcome Back to
            <br />
            Echo Ledger
          </h1>
          <p className="text-xl text-white/90">
            Manage your business with AI-powered intelligence
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              { icon: CheckCircle, text: 'AI-Powered Insights & Forecasting' },
              { icon: CheckCircle, text: 'Real-time Business Analytics' },
              { icon: CheckCircle, text: 'Secure & Encrypted Data' }
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Echo Ledger
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
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

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/account-type" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
