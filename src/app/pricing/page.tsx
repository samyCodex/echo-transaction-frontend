'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Shield, Crown, Sparkles, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import type { User } from '@/types/auth'

interface Plan {
  plan: string
  name: string
  price: number | null
  currency: string
  features: string[]
  limits: any
}

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    fetchPlans()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCurrentPlan()
    }
  }, [user])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/plans')
      setPlans(response.data?.body || [])
    } catch (err) {
      console.error('Failed to fetch plans:', err)
      // Fallback to static plans if API fails (e.g., when not authenticated)
      setPlans([
        {
          plan: 'free',
          name: 'Free',
          price: 0,
          currency: 'USD',
          features: [
            '100 transactions per month',
            '10 AI queries per day',
            'Basic analytics',
            'Email support'
          ],
          limits: {}
        },
        {
          plan: 'pro',
          name: 'Pro',
          price: 19,
          currency: 'USD',
          features: [
            'Unlimited transactions',
            'Unlimited AI queries',
            'Advanced analytics',
            'Priority support',
            'Custom reports',
            'API access'
          ],
          limits: {}
        },
        {
          plan: 'business',
          name: 'Business',
          price: 49,
          currency: 'USD',
          features: [
            'Everything in Pro',
            'Team collaboration',
            'Employee management',
            'Business metrics',
            'Multi-user access',
            'Dedicated support'
          ],
          limits: {}
        },
        {
          plan: 'enterprise',
          name: 'Enterprise',
          price: null,
          currency: 'USD',
          features: [
            'Everything in Business',
            'Custom integrations',
            'Dedicated account manager',
            'SLA guarantee',
            'Custom features',
            'White-label option'
          ],
          limits: {}
        }
      ])
    }
  }

  const fetchCurrentPlan = async () => {
    if (!user) return
    try {
      const response = await api.get('/subscription/my-plan')
      setCurrentPlan(response.data?.body?.plan || 'free')
    } catch (err) {
      console.error('Failed to fetch current plan:', err)
    }
  }

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      // For non-logged-in users, redirect to account-type selection with plan pre-selected
      sessionStorage.setItem('selectedPlan', plan)
      router.push('/auth/account-type')
      return
    }

    try {
      setUpgrading(plan)
      await api.post('/subscription/upgrade', { plan })
      setCurrentPlan(plan)
      
      // Redirect to dashboard after upgrade
      setTimeout(() => {
        if (user.type === 'BUSINESS') {
          router.push('/business')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upgrade plan')
    } finally {
      setUpgrading(null)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Navigation Header */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echo Ledger
              </span>
            </a>
            <div className="flex items-center gap-4">
              {user ? (
                <Button
                  onClick={() => router.push(user.type === 'BUSINESS' ? '/business' : '/dashboard')}
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <a href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Sign In
                  </a>
                  <Button
                    onClick={() => router.push('/auth/account-type')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose the Perfect Plan
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {plans.map((planData) => {
            const Icon = getPlanIcon(planData.plan)
            const colorClass = getPlanColor(planData.plan)
            const isCurrent = planData.plan === currentPlan
            const isEnterprise = planData.plan === 'enterprise'
            const isPopular = planData.plan === 'pro'

            return (
              <div
                key={planData.plan}
                className={`relative rounded-3xl border-2 p-8 transition-all bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl ${
                  isCurrent
                    ? 'border-green-500 dark:border-green-600 ring-4 ring-green-100 dark:ring-green-900/30 scale-105'
                    : isPopular
                    ? 'border-purple-500 dark:border-purple-600 scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ✓ Current Plan
                  </div>
                )}

                {isPopular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClass} mb-6 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {planData.name}
                </h3>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {planData.price === null ? (
                    <div>
                      <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Custom
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contact sales</p>
                    </div>
                  ) : planData.price === 0 ? (
                    <div>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">$0</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Forever free</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">${planData.price}</span>
                        <span className="text-base text-gray-500 dark:text-gray-400">/month</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Billed monthly</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {planData.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrent ? (
                  <Button disabled className="w-full h-12 bg-gray-100 dark:bg-gray-700 text-gray-500" variant="outline">
                    Current Plan
                  </Button>
                ) : isEnterprise ? (
                  <Button
                    onClick={() => window.open('mailto:sales@echoledger.com', '_blank')}
                    className={`w-full h-12 bg-gradient-to-r ${colorClass} hover:opacity-90 text-white font-semibold shadow-lg`}
                  >
                    Contact Sales
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(planData.plan)}
                    disabled={upgrading === planData.plan}
                    className={`w-full h-12 bg-gradient-to-r ${colorClass} hover:opacity-90 text-white font-semibold shadow-lg`}
                  >
                    {upgrading === planData.plan ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Upgrading...
                      </div>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Check, label: '24/7 Support', desc: 'Always here to help' },
              { icon: Shield, label: 'Secure Payment', desc: 'Bank-level security' },
              { icon: Zap, label: 'Instant Access', desc: 'Start immediately' },
              { icon: Star, label: 'Money-Back', desc: '30-day guarantee' }
            ].map((item, idx) => (
              <div key={idx} className="p-6">
                <item.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
