'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Building2, Sparkles, TrendingUp, Users, BarChart3, Wallet, Crown, CheckCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function AccountTypePage() {
  const router = useRouter()

  // No session validation needed - this is now the first step

  const handleAccountTypeSelect = (type: 'personal' | 'business') => {
    sessionStorage.setItem('accountType', type)
    router.push(`/auth/plan-selection?type=${type}`)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-12 flex-col justify-between relative overflow-hidden">
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
            Choose Your
            <br />
            Perfect Plan
          </h1>
          <p className="text-xl text-white/90">
            Whether you're an individual or a business, we've got you covered
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              { icon: CheckCircle, text: 'Easy to switch anytime' },
              { icon: TrendingUp, text: 'Grow at your own pace' },
              { icon: Crown, text: 'Premium features for all' }
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

      {/* Right Side - Account Selection */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-2xl space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Echo Ledger
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Account Type</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Select the option that best fits your needs
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Account */}
            <button
              onClick={() => handleAccountTypeSelect('personal')}
              className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Perfect for managing your personal finances
              </p>
              
              <ul className="space-y-3">
                {[
                  { icon: Wallet, text: 'Personal budget tracking' },
                  { icon: BarChart3, text: 'Expense analytics' },
                  { icon: Sparkles, text: 'AI financial assistant' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <item.icon className="w-4 h-4 text-blue-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Get Started →</span>
                  <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-180" />
                </div>
              </div>
            </button>

            {/* Business Account */}
            <button
              onClick={() => handleAccountTypeSelect('business')}
              className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-green-500 dark:hover:border-green-600 hover:shadow-2xl transition-all duration-300 text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Powerful tools for teams and organizations
              </p>
              
              <ul className="space-y-3">
                {[
                  { icon: Users, text: 'Team management' },
                  { icon: TrendingUp, text: 'Business analytics' },
                  { icon: Crown, text: 'Advanced AI insights' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <item.icon className="w-4 h-4 text-green-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Get Started →</span>
                  <ArrowLeft className="w-4 h-4 text-green-600 dark:text-green-400 rotate-180" />
                </div>
              </div>
            </button>
          </div>

          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't worry, you can change your account type later in settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
