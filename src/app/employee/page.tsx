'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Target, TrendingUp, Award, Activity, DollarSign, CheckCircle, Clock, 
  Calendar, Sparkles, Moon, Sun, LogOut, ArrowUp, ArrowDown, Trophy,
  Star, BarChart3, Users, Mic, Send, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { businessMetricsApi, type EmployeeDashboard, type Transaction, type EmployeeGoal } from '@/lib/business-metrics-api'
import { employeeApi } from '@/lib/employee-api'
import api from '@/lib/api'
import UsageWidget from '@/components/subscription/UsageWidget'

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [dashboard, setDashboard] = useState<EmployeeDashboard | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  
  // AI Transaction Recording
  const [aiPrompt, setAiPrompt] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Get employee record for this user
    const fetchEmployeeInfo = async () => {
      try {
        const businesses = await employeeApi.getMyBusinesses()
        if (businesses.length > 0) {
          setEmployeeId(businesses[0].id)
          setBusinessId(businesses[0].business_id)
        }
      } catch (err) {
        console.error('Failed to load employee info:', err)
      }
    }

    fetchEmployeeInfo()
  }, [user?.id])

  useEffect(() => {
    if (employeeId && businessId) {
      fetchDashboard()
      fetchTransactions()
    }
  }, [employeeId, businessId])

  const fetchDashboard = async () => {
    if (!employeeId || !businessId) return

    try {
      setLoading(true)
      const data = await businessMetricsApi.getEmployeeDashboard(employeeId, businessId)
      setDashboard(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    if (!employeeId) return

    try {
      const data = await businessMetricsApi.getEmployeeTransactions(employeeId, 10)
      setTransactions(data)
    } catch (err: any) {
      console.error('Failed to load transactions:', err)
    }
  }

  const getGoalProgress = (goal: EmployeeGoal) => {
    return (goal.current_value / goal.target_value) * 100
  }

  const handleAITransaction = async () => {
    if (!aiPrompt.trim() || !businessId || !employeeId) {
      setError('Please describe your transaction')
      return
    }

    try {
      setLoading(true)
      setAiResponse(null)
      
      // Call AI to extract transaction
      const response = await api.post('/prompt/extract-transaction', {
        prompt: aiPrompt
      })
      
      const aiText = response.data?.body || response.data
      setAiResponse(aiText)
      
      // Try to parse transaction data
      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const transactionData = JSON.parse(jsonMatch[0])
          
          // Create transaction if valid
          if (transactionData.amount && transactionData.item) {
            await businessMetricsApi.createTransaction(businessId, {
              transaction_type: 'sale',
              amount: parseFloat(transactionData.amount),
              category: transactionData.item,
              description: aiPrompt,
              customer_name: transactionData.buyer || '',
              employee_id: employeeId
            })
            
            setAiPrompt('')
            setAiResponse('✅ Transaction recorded successfully!')
            
            // Refresh dashboard data
            fetchDashboard()
            fetchTransactions()
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process transaction')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex transition-all duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 min-w-80 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your performance</p>
        </div>

        {/* Stats Summary */}
        {dashboard && (
          <div className="p-4 space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8" />
                <div className={`flex items-center gap-1 text-sm`}>
                  {dashboard.salesGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {dashboard.salesGrowth.toFixed(1)}%
                </div>
              </div>
              <p className="text-2xl font-bold">${dashboard.personalSales.toFixed(0)}</p>
              <p className="text-sm opacity-90">Personal Sales</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8" />
                <span className="text-sm">{dashboard.transactionsCount} deals</span>
              </div>
              <p className="text-2xl font-bold">{dashboard.performanceScore.toFixed(1)}</p>
              <p className="text-sm opacity-90">Performance Score</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8" />
                <span className="text-sm">of {dashboard.totalEmployees}</span>
              </div>
              <p className="text-2xl font-bold">#{dashboard.rank}</p>
              <p className="text-sm opacity-90">Your Rank</p>
            </div>
          </div>
        )}

        {/* Subscription Plan Widget */}
        <div className="mt-auto p-4 border-t border-gray-200/30 dark:border-gray-700/30">
          <UsageWidget />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {user.firstname?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-6 py-8">
          {/* Welcome Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-2">
                Hello, {user.firstname}! 👋
              </h2>
              <p className="text-white/90 text-lg">
                Here's your performance overview
              </p>
            </div>
          </div>

          {/* AI Transaction Recording */}
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 p-6 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              AI Transaction Recording
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Simply describe your transaction in natural language, and AI will record it automatically!
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., I sold 2 bags of rice to John for $500 paid by transfer"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAITransaction()}
                  className="flex-1 bg-white dark:bg-gray-800 border-green-300 dark:border-green-700"
                />
                <Button
                  onClick={handleAITransaction}
                  disabled={loading || !aiPrompt.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Record
                    </>
                  )}
                </Button>
              </div>

              {aiResponse && (
                <div className={`p-3 rounded-lg ${aiResponse.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'}`}>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{aiResponse}</p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Example prompts:</p>
                <div className="space-y-1">
                  {[
                    "Sold 3 laptops to ABC Company for $3000",
                    "I received $500 payment from Sarah via cash",
                    "Made a sale of office supplies worth $150"
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiPrompt(example)}
                      className="block text-xs text-left text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Goals */}
              {dashboard && dashboard.activeGoals.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Active Goals
                  </h3>
                  <div className="space-y-4">
                    {dashboard.activeGoals.map((goal) => {
                      const progress = getGoalProgress(goal)
                      const daysLeft = Math.ceil((new Date(goal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div key={goal.id} className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                              <Award className="w-4 h-4" />
                              <span className="text-xs font-semibold">{goal.reward_points} pts</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                ${goal.current_value.toFixed(0)} / ${goal.target_value.toFixed(0)}
                              </span>
                              <span className={`font-semibold ${daysLeft > 7 ? 'text-green-600' : daysLeft > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {daysLeft} days left
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-center font-semibold text-gray-700 dark:text-gray-300">
                              {progress.toFixed(1)}% Complete
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* AI Tips */}
              {dashboard && dashboard.aiTips.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Tips For You
                  </h3>
                  <div className="space-y-2">
                    {dashboard.aiTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Transactions Sidebar */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Transactions</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((txn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {txn.description || txn.category || 'Sale'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {txn.transaction_type} • {new Date(txn.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        ${txn.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
