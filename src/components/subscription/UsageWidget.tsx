'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Zap, AlertTriangle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface UsageStats {
  plan: string
  limits: any
  usage: {
    transactions_this_month: number
    ai_queries_today: number
  }
  percentages: {
    transactions: number
    ai_queries: number
  }
}

export default function UsageWidget() {
  const router = useRouter()
  const [usage, setUsage] = useState<UsageStats | null>(null)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await api.get('/subscription/usage')
      console.log('📊 Usage data:', response.data)
      setUsage(response.data?.body)
    } catch (err) {
      console.error('❌ Failed to fetch usage:', err)
    }
  }

  if (!usage) {
    console.log('⚠️ No usage data - subscription widget hidden')
    return null
  }

  const isNearLimit = (percentage: number) => percentage >= 80
  const isAtLimit = (percentage: number) => percentage >= 100

  return (
    <>
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            {usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} Plan
          </h3>
          <Button
            onClick={() => router.push('/pricing')}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Upgrade
          </Button>
        </div>

        <div className="space-y-4">
          {/* Transactions Usage */}
          {usage.limits.maxTransactionsPerMonth !== -1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transactions This Month
                </span>
                <span className={`text-sm font-bold ${
                  isAtLimit(usage.percentages.transactions) ? 'text-red-600' :
                  isNearLimit(usage.percentages.transactions) ? 'text-yellow-600' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {usage.usage.transactions_this_month} / {usage.limits.maxTransactionsPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isAtLimit(usage.percentages.transactions) ? 'bg-red-500' :
                    isNearLimit(usage.percentages.transactions) ? 'bg-yellow-500' :
                    'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}
                  style={{ width: `${Math.min(usage.percentages.transactions, 100)}%` }}
                />
              </div>
              {isNearLimit(usage.percentages.transactions) && (
                <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    You're approaching your monthly limit. Consider upgrading!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Queries Usage */}
          {usage.limits.maxAIQueriesPerDay !== -1 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Queries Today
                </span>
                <span className={`text-sm font-bold ${
                  isAtLimit(usage.percentages.ai_queries) ? 'text-red-600' :
                  isNearLimit(usage.percentages.ai_queries) ? 'text-yellow-600' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {usage.usage.ai_queries_today} / {usage.limits.maxAIQueriesPerDay}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isAtLimit(usage.percentages.ai_queries) ? 'bg-red-500' :
                    isNearLimit(usage.percentages.ai_queries) ? 'bg-yellow-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-600'
                  }`}
                  style={{ width: `${Math.min(usage.percentages.ai_queries, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlimited Message */}
          {usage.limits.maxTransactionsPerMonth === -1 && usage.limits.maxAIQueriesPerDay === -1 && (
            <div className="text-center py-4">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Unlimited Usage
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enjoy unrestricted access to all features!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
