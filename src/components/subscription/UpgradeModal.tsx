'use client'

import { useState, useEffect } from 'react'
import { X, Check, Zap, Shield, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface Plan {
  plan: string
  name: string
  price: number | null
  currency: string
  features: string[]
  limits: any
}

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  onUpgrade?: () => void
}

export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', onUpgrade }: UpgradeModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription/plans')
      setPlans(response.data?.body || [])
    } catch (err) {
      console.error('Failed to fetch plans:', err)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      setUpgrading(plan)
      await api.post('/subscription/upgrade', { plan })
      
      if (onUpgrade) {
        onUpgrade()
      }
      
      onClose()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upgrade plan')
    } finally {
      setUpgrading(null)
    }
  }

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl max-w-[1400px] w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-white/90 text-lg">Upgrade to unlock premium features and grow your business</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-colors z-20"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((planData) => {
            const Icon = getPlanIcon(planData.plan)
            const colorClass = getPlanColor(planData.plan)
            const isCurrent = planData.plan === currentPlan
            const isEnterprise = planData.plan === 'enterprise'

            return (
              <div
                key={planData.plan}
                className={`relative rounded-3xl border-2 p-8 transition-all bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl ${
                  isCurrent
                    ? 'border-green-500 dark:border-green-600 ring-4 ring-green-100 dark:ring-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ✓ Current Plan
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
                  {planData.features.slice(0, 6).map((feature, idx) => (
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
                      'Upgrade Now'
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="rounded-b-3xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
