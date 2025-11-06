'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Zap, Shield, Crown, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

import { Suspense } from 'react'
interface Plan {
  plan: string
  name: string
  price: number | null
  currency: string
  features: string[]
  limits: any
}
function PlanSelectionContent() {
   const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams.get('type') as 'personal' | 'business'
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedAccountType = sessionStorage.getItem('accountType')
    
    // If no account type, redirect to account type selection
    if (!accountType || storedAccountType !== accountType) {
      router.push('/auth/account-type')
      return
    }

    fetchPlans()
  }, [router, accountType])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/plans')
      const allPlans = response.data?.body || []
      // Filter plans based on account type
      const filteredPlans = accountType === 'personal' 
        ? allPlans.filter((p: Plan) => ['free', 'pro'].includes(p.plan))
        : allPlans // Business users see all plans
      setPlans(filteredPlans)
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      // Fallback to default plans if API fails
      setPlans([
        {
          plan: 'free',
          name: 'Free',
          price: 0,
          currency: 'USD',
          features: ['100 transactions/month', '10 AI queries/day', 'Basic analytics'],
          limits: {}
        },
        {
          plan: 'pro',
          name: 'Pro',
          price: 19,
          currency: 'USD',
          features: ['Unlimited transactions', 'Unlimited AI queries', 'Advanced analytics', 'Priority support'],
          limits: {}
        }
      ])
    }
  }

  const handleContinue = () => {
    // Store selected plan in session storage
    sessionStorage.setItem('selectedPlan', selectedPlan)
    // Go to email verification (next step in flow)
    router.push('/auth/email-verification')
  }

  const handleSkip = () => {
    // Default to free plan
    sessionStorage.setItem('selectedPlan', 'free')
    // Go to email verification (next step in flow)
    router.push('/auth/email-verification')
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return Zap
      case 'pro': return Shield
      case 'business': return Crown
      case 'enterprise': return Sparkles
      default: return Zap
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'from-gray-500 to-gray-600'
      case 'pro': return 'from-blue-500 to-purple-600'
      case 'business': return 'from-purple-600 to-pink-600'
      case 'enterprise': return 'from-yellow-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/auth/account-type"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Account Type
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Step 2 of 5
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Start with a 14-day free trial of any paid plan. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((planData) => {
            const Icon = getPlanIcon(planData.plan)
            const colorClass = getPlanColor(planData.plan)
            const isSelected = planData.plan === selectedPlan
            const isPopular = planData.plan === 'pro'
            const isFree = planData.plan === 'free'

            return (
              <div
                key={planData.plan}
                onClick={() => setSelectedPlan(planData.plan)}
                className={`relative rounded-2xl border-2 p-6 transition-all cursor-pointer bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30 scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ⭐ Recommended
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClass} mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {planData.name}
                </h3>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  {planData.price === 0 ? (
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">$0</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Forever free</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">${planData.price}</span>
                        <span className="text-base text-gray-500 dark:text-gray-400">/month</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold">14-day free trial</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {planData.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="px-8 py-6 text-lg"
          >
            Skip (Start with Free)
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-6 text-lg shadow-xl hover:scale-105 transition-all"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Loading...
              </div>
            ) : (
              <>
                Continue with {plans.find(p => p.plan === selectedPlan)?.name || 'Free'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ✨ No credit card required for trial • Cancel anytime • Upgrade/downgrade anytime
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            🔒 Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )

}
export default function PlanSelectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanSelectionContent />
    </Suspense>
  )
}
