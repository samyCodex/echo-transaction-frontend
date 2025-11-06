'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Users, UserPlus, TrendingUp, Building2, BarChart3, X, CheckCircle, Clock, Ban, 
  Search, Filter, Mail, Shield, Briefcase, Calculator, Moon, Sun, LogOut,
  Crown, Star, ChevronRight, Activity, DollarSign, Target, Sparkles, Plus, ArrowUp, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { employeeApi, type Employee, type EmployeeStats } from '@/lib/employee-api'
import { businessMetricsApi, type BusinessOverview, type Transaction } from '@/lib/business-metrics-api'
import api from '@/lib/api'
import UsageWidget from '@/components/subscription/UsageWidget'

export default function BusinessDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [activeView, setActiveView] = useState<'overview' | 'employees' | 'analytics'>('overview')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Business metrics state
  const [businessOverview, setBusinessOverview] = useState<BusinessOverview | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  
  // Advanced Analytics
  const [forecast, setForecast] = useState<{ amount: number; confidence: string; reasoning: string } | null>(null)
  const [anomalies, setAnomalies] = useState<Array<{ alert: string; severity: string }>>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Invite employee form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'employee' | 'accountant'>('employee')

  // Transaction form
  const [transactionData, setTransactionData] = useState({
    transaction_type: 'sale' as 'sale' | 'refund' | 'payment' | 'expense',
    amount: '',
    category: '',
    description: '',
    customer_name: '',
    employee_id: ''
  })

  useEffect(() => {
    if (!user) return
    
    if (user.type !== 'BUSINESS') {
      router.push('/dashboard')
      return
    }

    fetchEmployees()
    fetchStats()
    fetchBusinessOverview()
    fetchTransactions()
    fetchAdvancedAnalytics()
  }, [user?.id])

  const fetchEmployees = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // Business users use their own ID as business_id
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) {
        console.warn('No business ID available')
        setEmployees([])
        return
      }
      const data = await employeeApi.getBusinessEmployees(businessId)
      setEmployees(data)
    } catch (err: any) {
      console.error('Failed to load employees:', err)
      // Don't show error for empty employee list
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load employees')
      }
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return
    
    try {
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) return
      const data = await employeeApi.getEmployeeStats(businessId)
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  const fetchBusinessOverview = async () => {
    if (!user) return
    
    try {
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) return
      const data = await businessMetricsApi.getBusinessOverview(businessId)
      setBusinessOverview(data)
    } catch (err: any) {
      console.error('Failed to load business overview:', err)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return
    
    try {
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) return
      const data = await businessMetricsApi.getBusinessTransactions(businessId, 20)
      setTransactions(data)
    } catch (err: any) {
      console.error('Failed to load transactions:', err)
    }
  }

  const fetchAdvancedAnalytics = async () => {
    if (!user) return
    
    try {
      setLoadingAnalytics(true)
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) {
        console.log('⚠️ No business ID - skipping analytics')
        return
      }
      
      // Call AI forecasting (with error handling)
      try {
        console.log('📊 Fetching AI forecast...')
        const forecastResponse = await api.post('/business-metrics/forecast', {
          business_id: businessId
        })
        
        if (forecastResponse.data?.body) {
          console.log('✅ Forecast loaded:', forecastResponse.data.body)
          setForecast(forecastResponse.data.body)
        }
      } catch (forecastErr: any) {
        console.warn('⚠️ Forecast endpoint not available (PRO+ feature):', forecastErr?.response?.status)
        // Forecast is optional - silently skip if not available
      }
      
      // Call AI anomaly detection (with error handling)
      try {
        console.log('🔍 Fetching anomaly detection...')
        const anomalyResponse = await api.post('/business-metrics/anomalies', {
          business_id: businessId
        })
        
        if (anomalyResponse.data?.body && Array.isArray(anomalyResponse.data.body)) {
          console.log('✅ Anomalies loaded:', anomalyResponse.data.body)
          setAnomalies(anomalyResponse.data.body)
        }
      } catch (anomalyErr: any) {
        console.warn('⚠️ Anomaly detection not available (BUSINESS+ feature):', anomalyErr?.response?.status)
        // Anomalies are optional - silently skip if not available
      }
    } catch (err: any) {
      console.error('❌ Advanced analytics error:', err)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const handleCreateTransaction = async () => {
    if (!transactionData.amount || !user) {
      setError('Please fill in required fields')
      return
    }

    try {
      setLoading(true)
      const businessId = user.type === 'BUSINESS' ? user.id : (user as any).business_id
      if (!businessId) {
        setError('Business ID not found')
        return
      }
      
      await businessMetricsApi.createTransaction(businessId, {
        ...transactionData,
        amount: parseFloat(transactionData.amount)
      })
      
      setShowTransactionForm(false)
      setTransactionData({
        transaction_type: 'sale',
        amount: '',
        category: '',
        description: '',
        customer_name: '',
        employee_id: ''
      })
      setError(null)
      
      // Refresh data
      fetchBusinessOverview()
      fetchTransactions()
      fetchStats()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteEmployee = async () => {
    if (!inviteEmail || !user) {
      setError('Please enter an email address')
      return
    }

    try {
      setLoading(true)
      await employeeApi.inviteEmployee({
        email: inviteEmail,
        employee_role: inviteRole,
        business_id: (user as any).business_id || user.id
      })
      
      setShowInviteForm(false)
      setInviteEmail('')
      setInviteRole('employee')
      setError(null)
      fetchEmployees()
      fetchStats()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite employee')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return

    try {
      await employeeApi.removeEmployee((user as any).business_id || user!.id, employeeId)
      fetchEmployees()
      fetchStats()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove employee')
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Crown },
      manager: { bg: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: Star },
      employee: { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: Briefcase },
      accountant: { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', icon: Calculator }
    }
    return styles[role as keyof typeof styles] || styles.employee
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { text: 'Active', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      pending: { text: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
      inactive: { text: 'Inactive', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: Ban }
    }
    return styles[status as keyof typeof styles] || styles.active
  }

  const filteredEmployees = employees.filter(emp => 
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (user?.type !== 'BUSINESS') {
    return null
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex transition-all duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 min-w-80 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {user.business?.business_name || 'Business Dashboard'}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user.business?.business_type}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-2 mb-4">
            <div
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'overview'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('overview')}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Overview</span>
            </div>

            <div
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'employees'
                  ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('employees')}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Team Members</span>
            </div>

            <div
              className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                activeView === 'analytics'
                  ? 'text-white bg-gradient-to-r from-pink-600 to-orange-600 shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => setActiveView('analytics')}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">Analytics</span>
            </div>
          </div>

          {/* Stats Summary in Sidebar */}
          {stats && (
            <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Team Overview
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Total', value: stats.total, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Active', value: stats.active, color: 'text-green-600 dark:text-green-400' },
                  { label: 'Pending', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400' },
                  { label: 'Inactive', value: stats.inactive, color: 'text-red-600 dark:text-red-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Plan Widget */}
          <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
            <UsageWidget />
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              {user.firstname?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Business Owner</p>
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
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Hello, {user.firstname}! 👋
                </h2>
                <p className="text-white/90 text-lg">
                  Manage your team and track business performance
                </p>
              </div>
              <div className="hidden md:block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {(stats || businessOverview) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'Total Revenue', 
                value: businessOverview ? `$${(businessOverview.totalRevenue / 1000).toFixed(1)}K` : '-', 
                icon: DollarSign, 
                gradient: 'from-green-500 to-emerald-600', 
                change: businessOverview ? `${businessOverview.revenueGrowth > 0 ? '+' : ''}${businessOverview.revenueGrowth.toFixed(1)}%` : '-',
                isPositive: businessOverview ? businessOverview.revenueGrowth >= 0 : true
              },
              { 
                label: 'Transactions', 
                value: businessOverview?.totalTransactions || 0, 
                icon: Activity, 
                gradient: 'from-blue-500 to-cyan-600', 
                change: businessOverview ? `${businessOverview.transactionsGrowth > 0 ? '+' : ''}${businessOverview.transactionsGrowth.toFixed(1)}%` : '-',
                isPositive: businessOverview ? businessOverview.transactionsGrowth >= 0 : true
              },
              { 
                label: 'Active Team', 
                value: stats?.active || businessOverview?.activeEmployees || 0, 
                icon: Users, 
                gradient: 'from-purple-500 to-pink-600', 
                change: stats ? `${stats.total} total` : '-',
                isPositive: true
              },
              { 
                label: 'Pending', 
                value: stats?.pending || 0, 
                icon: Clock, 
                gradient: 'from-yellow-500 to-orange-600', 
                change: stats?.pending ? `${stats.pending} invites` : 'No invites',
                isPositive: true
              }
            ].map(({ label, value, icon: Icon, gradient, change, isPositive }, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
              <div
  className={`absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity rounded-full blur-2xl bg-gradient-to-br ${gradient}`}
  style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
/>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {typeof change === 'string' && change.includes('%') && (
                        isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                      <span>{change}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 animate-shake">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                  <Button
                    onClick={() => setShowTransactionForm(!showTransactionForm)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
                
                {showTransactionForm && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">New Transaction</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <select
                        value={transactionData.transaction_type}
                        onChange={(e) => setTransactionData({...transactionData, transaction_type: e.target.value as any})}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="sale">Sale</option>
                        <option value="refund">Refund</option>
                        <option value="payment">Payment</option>
                        <option value="expense">Expense</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={transactionData.amount}
                        onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                        className="bg-white dark:bg-gray-800 text-sm"
                      />
                      <Input
                        placeholder="Category"
                        value={transactionData.category}
                        onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                        className="bg-white dark:bg-gray-800 text-sm"
                      />
                      <Input
                        placeholder="Customer Name"
                        value={transactionData.customer_name}
                        onChange={(e) => setTransactionData({...transactionData, customer_name: e.target.value})}
                        className="bg-white dark:bg-gray-800 text-sm"
                      />
                      <Input
                        placeholder="Description"
                        value={transactionData.description}
                        onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                        className="bg-white dark:bg-gray-800 col-span-2 text-sm"
                      />
                      <Button
                        onClick={handleCreateTransaction}
                        disabled={loading}
                        className="col-span-2 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {loading ? 'Creating...' : 'Create Transaction'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Invite Employee', icon: UserPlus, action: () => setActiveView('employees'), gradient: 'from-blue-500 to-purple-500' },
                    { label: 'View Analytics', icon: BarChart3, action: () => setActiveView('analytics'), gradient: 'from-green-500 to-emerald-500' },
                    { label: 'Team Directory', icon: Users, action: () => setActiveView('employees'), gradient: 'from-orange-500 to-pink-500' },
                    { label: 'Add Transaction', icon: Plus, action: () => setShowTransactionForm(true), gradient: 'from-purple-500 to-pink-500' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className={`group p-6 rounded-xl bg-gradient-to-br ${item.gradient} hover:shadow-lg hover:scale-105 transition-all`}
                    >
                      <item.icon className="w-8 h-8 text-white mb-3" />
                      <p className="font-semibold text-white text-left">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              {businessOverview && businessOverview.topPerformers.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Top Performers This Month
                  </h3>
                  <div className="space-y-3">
                    {businessOverview.topPerformers.map((performer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-yellow-600">#{idx + 1}</div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{performer.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Score: {performer.performance_score.toFixed(1)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${performer.sales.toFixed(0)}</p>
                          <p className="text-xs text-gray-500">Total Sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {businessOverview && businessOverview.aiInsights.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Insights
                  </h3>
                  <div className="space-y-2">
                    {businessOverview.aiInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Transactions Sidebar */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((txn, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {txn.description || txn.category || 'Transaction'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {txn.transaction_type} • {new Date(txn.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${txn.transaction_type === 'sale' ? 'text-green-600' : txn.transaction_type === 'expense' ? 'text-red-600' : 'text-gray-600'}`}>
                        {txn.transaction_type === 'expense' ? '-' : ''}${txn.amount.toFixed(2)}
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
        )}

        {activeView === 'employees' && (
          <div className="space-y-6">
            {/* Header with Search and Invite */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Team Members</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your organization's team</p>
                </div>
                <Button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite Employee
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Invite Form */}
            {showInviteForm && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Invite New Team Member
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="email"
                    placeholder="employee@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-white dark:bg-gray-800 h-12 rounded-xl"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={handleInviteEmployee}
                    disabled={loading}
                    className="h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {loading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            )}

            {/* Employee List */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {searchQuery ? 'No results found' : 'No employees yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchQuery ? 'Try adjusting your search' : 'Start building your team by inviting members'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowInviteForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Invite First Employee
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEmployees.map((employee) => {
                    const roleBadge = getRoleBadge(employee.employee_role)
                    const statusBadge = getStatusBadge(employee.status)
                    const StatusIcon = statusBadge.icon

                    return (
                      <div
                        key={employee.id}
                        className="group flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${roleBadge.bg} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                            {employee.firstname?.charAt(0) || employee.email?.charAt(0)}
                            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-gray-800 rounded-full">
                              <roleBadge.icon className="w-3 h-3" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {employee.firstname && employee.lastname
                                ? `${employee.firstname} ${employee.lastname}`
                                : employee.email}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusBadge.bg} ${statusBadge.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusBadge.text}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                              {employee.employee_role}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* AI Forecast & Anomalies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Forecast */}
              {forecast && (
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Revenue Forecast
                  </h3>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Next Month</p>
                    <p className="text-4xl font-bold text-purple-600 mb-2">
                      ${(forecast.amount / 1000).toFixed(1)}K
                    </p>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      forecast.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      forecast.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {forecast.confidence.toUpperCase()} Confidence
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>AI Reasoning:</strong> {forecast.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* Anomaly Alerts */}
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600" />
                  Anomaly Detection
                </h3>
                {anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalies.map((anomaly, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border-2 ${
                        anomaly.severity === 'high' ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
                        anomaly.severity === 'medium' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
                        'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
                      }`}>
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded-full ${
                            anomaly.severity === 'high' ? 'bg-red-200 dark:bg-red-800' :
                            anomaly.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-800' :
                            'bg-blue-200 dark:bg-blue-800'
                          }`}>
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold mb-1 ${
                              anomaly.severity === 'high' ? 'text-red-900 dark:text-red-200' :
                              anomaly.severity === 'medium' ? 'text-yellow-900 dark:text-yellow-200' :
                              'text-blue-900 dark:text-blue-200'
                            }`}>
                              {anomaly.severity.toUpperCase()} ALERT
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{anomaly.alert}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">All Clear!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No anomalies detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue & Transaction Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Revenue Overview
                </h3>
                {businessOverview ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <p className="text-4xl font-bold text-green-600 mb-2">
                        ${(businessOverview.totalRevenue / 1000).toFixed(1)}K
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue This Month</p>
                      <div className={`flex items-center justify-center gap-1 mt-2 text-sm font-semibold ${businessOverview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {businessOverview.revenueGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {Math.abs(businessOverview.revenueGrowth).toFixed(1)}% from last month
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{businessOverview.totalTransactions}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Transactions</p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600">
                          ${businessOverview.totalTransactions > 0 ? (businessOverview.totalRevenue / businessOverview.totalTransactions).toFixed(2) : '0'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Transaction</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>

              {/* Team Performance */}
              <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Team Performance
                </h3>
                {stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Active Members</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Team Size</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                            style={{ width: `${(stats.active / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.total}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {((stats.active / stats.total) * 100).toFixed(0)}% active
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No team data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Breakdown */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Transaction Breakdown
              </h3>
              {transactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { type: 'sale', label: 'Sales', color: 'green', icon: DollarSign },
                    { type: 'expense', label: 'Expenses', color: 'red', icon: TrendingUp },
                    { type: 'refund', label: 'Refunds', color: 'yellow', icon: Activity },
                    { type: 'payment', label: 'Payments', color: 'blue', icon: CheckCircle }
                  ].map(({ type, label, color, icon: Icon }) => {
                    const typeTransactions = transactions.filter(t => t.transaction_type === type)
                    const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0)
                    return (
                      <div key={type} className={`p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 text-${color}-600`} />
                          <span className={`text-2xl font-bold text-${color}-600`}>{typeTransactions.length}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                        <p className={`text-sm font-bold text-${color}-700 dark:text-${color}-400`}>
                          ${total.toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
