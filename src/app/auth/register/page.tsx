'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, User, Building2, Sparkles, Lock, CheckCircle, Shield, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { formatError, validatePassword } from '@/lib/utils'

const personalSchema = z.object({
  firstname: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastname: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  ai_name: z.string().min(2).max(50).optional(),
  ai_role: z.string().max(200).optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

const businessSchema = z.object({
  firstname: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastname: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  ai_name: z.string().min(2).max(50).optional(),
  ai_role: z.string().max(200).optional(),
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  business_type: z.string().min(2, 'Business type must be at least 2 characters').max(200),
  employee_count: z.number().int().min(0).default(0),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type PersonalFormData = z.infer<typeof personalSchema>
type BusinessFormData = z.infer<typeof businessSchema>

function RegisterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams.get('type') as 'personal' | 'business'
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [] as string[] })

  const isPersonal = accountType === 'personal'
  const schema = isPersonal ? personalSchema : businessSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PersonalFormData | BusinessFormData>({
    resolver: zodResolver(schema),
  })

  const passwordValue = watch('password')

  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId')
    const storedAccountType = sessionStorage.getItem('accountType')
    const selectedPlan = sessionStorage.getItem('selectedPlan')
    
    if (!sessionId || !accountType || storedAccountType !== accountType) {
      router.push('/auth/email-verification')
      return
    }
    
    // If no plan selected, redirect to plan selection
    if (!selectedPlan) {
      router.push(`/auth/plan-selection?type=${accountType}`)
    }
  }, [router, accountType])

  useEffect(() => {
    if (passwordValue) {
      setPasswordValidation(validatePassword(passwordValue))
    }
  }, [passwordValue])

  const onSubmit = async (data: PersonalFormData | BusinessFormData) => {
    const sessionId = sessionStorage.getItem('sessionId')
    const selectedPlan = sessionStorage.getItem('selectedPlan') || 'free'
    
    if (!sessionId) {
      router.push('/auth/email-verification')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let response
      
      if (isPersonal) {
        response = await authApi.registerPersonal({
          ...data as PersonalFormData,
          sessionId,
          type: 'PERSONAL',
          // plan: selectedPlan
        })
      } else {
        const businessData = data as BusinessFormData
        response = await authApi.registerBusiness({
          firstname: businessData.firstname,
          lastname: businessData.lastname,
          password: businessData.password,
          confirm_password: businessData.confirm_password,
          ai_name: businessData.ai_name,
          ai_role: businessData.ai_role,
          sessionId,
          type: 'BUSINESS',
          // plan: selectedPlan,
          business: {
            business_name: businessData.business_name,
            business_type: businessData.business_type,
            employee_count: businessData.employee_count,
          },
        })
      }

      // Handle response structure (backend uses body property)
      const responseData = response.body || response.data
      console.log('📥 Registration Response:', response)
      console.log('📥 Response Data:', responseData)
      console.log('📥 Account Type Selected:', accountType)
      console.log('📥 Is Personal:', isPersonal)
      console.log('📥 User Type in Response:', responseData?.type)
      
      if (!responseData || !responseData.accessToken) {
        throw new Error('Invalid response: missing accessToken')
      }
      
      // Store auth data
      localStorage.setItem('accessToken', responseData.accessToken)
      const { accessToken, ...user } = responseData
      localStorage.setItem('user', JSON.stringify(user))
      
      // Clear session storage
      sessionStorage.removeItem('sessionId')
      sessionStorage.removeItem('accountType')
      sessionStorage.removeItem('verificationEmail')

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(formatError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const gradientClass = isPersonal 
    ? 'from-blue-600 via-indigo-600 to-purple-600'
    : 'from-green-600 via-emerald-600 to-teal-600'
  
  const iconBgClass = isPersonal
    ? 'from-blue-600 to-indigo-600'
    : 'from-green-600 to-emerald-600'

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${gradientClass} p-12 flex-col justify-between relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <Link href="/auth/account-type" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            {isPersonal ? (
              <User className="w-12 h-12 text-white" />
            ) : (
              <Building2 className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            {isPersonal ? 'Your Personal' : 'Your Business'}
            <br />
            Journey Begins
          </h1>
          <p className="text-xl text-white/90">
            {isPersonal 
              ? 'Take control of your finances with AI-powered insights'
              : 'Manage your team and grow your business smarter'
            }
          </p>
          
          <div className="space-y-4 pt-8">
            {(isPersonal ? [
              { icon: Shield, text: 'Your data is secure & encrypted' },
              { icon: Sparkles, text: 'AI-powered financial assistant' },
              { icon: TrendingUp, text: 'Smart budget recommendations' }
            ] : [
              { icon: Users, text: 'Team collaboration tools' },
              { icon: TrendingUp, text: 'Real-time business analytics' },
              { icon: Shield, text: 'Enterprise-grade security' }
            ]).map((item, idx) => (
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

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBgClass} flex items-center justify-center`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r ${iconBgClass} bg-clip-text text-transparent`}>
              Echo Ledger
            </span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {isPersonal ? (
                <div className={`p-2 rounded-xl bg-gradient-to-br ${iconBgClass}`}>
                  <User className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className={`p-2 rounded-xl bg-gradient-to-br ${iconBgClass}`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isPersonal ? 'Personal' : 'Business'} Account
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your {isPersonal ? 'personal' : 'business'} profile
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstname" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  First Name *
                </label>
                <Input
                  id="firstname"
                  placeholder="John"
                  className="h-11"
                  {...register('firstname')}
                />
                {errors.firstname && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.firstname.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastname" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Last Name *
                </label>
                <Input
                  id="lastname"
                  placeholder="Doe"
                  className="h-11"
                  {...register('lastname')}
                />
                {errors.lastname && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            {/* Business Details (only for business accounts) */}
            {!isPersonal && (
              <>
                <div className="space-y-2">
                  <label htmlFor="business_name" className="text-sm font-medium  text-black">
                    Business Name *
                  </label>
                  <Input
                    id="business_name"
                    placeholder="Acme Corporation"
                    {...register('business_name' as any)}
                  />
                  {(errors as any).business_name && (
                    <p className="text-sm text-red-600">{(errors as any).business_name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="business_type" className="text-sm font-medium text-black">
                      Business Type *
                    </label>
                    <Input
                      id="business_type"
                      placeholder="Ltd, Enterprise, etc."
                      {...register('business_type' as any)}
                    />
                    {(errors as any).business_type && (
                      <p className="text-sm text-red-600">{(errors as any).business_type.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="employee_count" className="text-sm font-medium text-black">
                      Employee Count
                    </label>
                    <Input
                      id="employee_count"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register('employee_count' as any, { valueAsNumber: true })}
                    />
                    {(errors as any).employee_count && (
                      <p className="text-sm text-red-600">{(errors as any).employee_count.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11"
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
              {passwordValue && !passwordValidation.isValid && (
                <div className="text-xs text-red-600 space-y-1 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {passwordValidation.errors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 h-11"
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Optional AI Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ai_name" className="text-sm font-medium text-black">
                  AI Assistant Name
                </label>
                <Input
                  id="ai_name"
                  placeholder="Assistant name"
                  {...register('ai_name')}
                />
                {errors.ai_name && (
                  <p className="text-sm text-red-600">{errors.ai_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="ai_role" className="text-sm font-medium text-black">
                  AI Role
                </label>
                <Input
                  id="ai_role"
                  placeholder="Assistant role"
                  {...register('ai_role')}
                />
                {errors.ai_role && (
                  <p className="text-sm text-red-600">{errors.ai_role.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 bg-gradient-to-r ${iconBgClass} hover:opacity-90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className={`bg-gradient-to-r ${iconBgClass} bg-clip-text text-transparent font-semibold hover:opacity-80`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-600">
          Loading registration form...
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  )
}