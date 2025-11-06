'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/inputBudget'
import { Plus, Trash2, Calculator, TrendingUp, TrendingDown, DollarSign, Clock, Search } from 'lucide-react'
import { budgetApi, BudgetAnalysisInput, BudgetExpense, BudgetAnalysisResult } from '@/lib/budget-api'
import { useAuth } from '@/hooks/useAuth'
import { AnalysisChartModal } from '@/components/budget/AnalysisChartModal'

export function SimpleBudgetAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<BudgetAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [recentAnalyses, setRecentAnalyses] = useState<BudgetAnalysisResult[]>([])
  const [searchQuery, setSearchQuery] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
  })

  // Modal states
  const [selectedAnalysis, setSelectedAnalysis] = useState<BudgetAnalysisResult | null>(null)
  const [isChartOpen, setIsChartOpen] = useState(false)
  const openChart = (analysis: BudgetAnalysisResult) => {
    setSelectedAnalysis(analysis)
    setIsChartOpen(true)
  }
  
  // Handle clicking on a recent budget card
  const handleRecentBudgetClick = (item: BudgetAnalysisResult) => {
    setAnalysis(item)
    // Update form data with the selected budget's currency
    setFormData(prev => ({ ...prev, currency: item.currency || prev.currency }))
  }

  // Fetch all recent analyses on mount
  useEffect(() => {
    if (user?.id) {
      fetchRecentAnalyses(user.id)
    }
  }, [user])

  const fetchRecentAnalyses = async (userId: string) => {
    try {
      const data = await budgetApi.searchBudgets({}, userId)
      console.log("✅ Recent analyses loaded:", data)
      setRecentAnalyses(Array.isArray(data) ? data : [data])
    } catch (error: any) {
      console.error(error)
      setError('Failed to load recent analyses')
      setRecentAnalyses([])
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const month = searchQuery.month ? parseInt(searchQuery.month) : undefined
      const year = searchQuery.year ? parseInt(searchQuery.year) : undefined
      const results = await budgetApi.searchBudgets({ month, year }, user?.id)
      const resultsArray = Array.isArray(results) ? results : [results]
      setRecentAnalyses(resultsArray)
      
      // If search returns results, show the first one in Analysis Results
      if (resultsArray.length > 0) {
        setAnalysis(resultsArray[0])
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Search failed')
      setRecentAnalyses([])
    } finally {
      setIsLoading(false)
    }
  }
  console.log(recentAnalyses)

  // Form state
const [formData, setFormData] = useState<BudgetAnalysisInput>({
  currency: recentAnalyses.length > 0 ? recentAnalyses[0].currency : 'USD', // default to USD if empty
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  earnings: 0,
  budgeted_expenses: [{ category: '', amount: 0 }],
  actual_expenses: [{ category: '', amount: 0 }]
});

  const addExpense = (type: 'budgeted_expenses' | 'actual_expenses') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { category: '', amount: 0 }]
    }))
  }

  const removeExpense = (type: 'budgeted_expenses' | 'actual_expenses', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const updateExpense = (
    type: 'budgeted_expenses' | 'actual_expenses',
    index: number,
    field: keyof BudgetExpense,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((expense, i) => 
        i === index ? { ...expense, [field]: value } : expense
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (formData.earnings <= 0) {
        setError("Earnings must be greater than 0")
        return
      }

      if (formData.budgeted_expenses.some(exp => !exp.category || exp.amount <= 0)) {
        setError("All budgeted expenses must have a category and amount greater than 0")
        return
      }

      if (formData.actual_expenses.some(exp => !exp.category || exp.amount <= 0)) {
        setError("All actual expenses must have a category and amount greater than 0")
        return
      }

      const result = await budgetApi.performBudgetAnalysis(formData)
      setAnalysis(result)
      setError(null)
      
      // Refresh recent analyses list after new analysis
      if (user?.id) {
        fetchRecentAnalyses(user.id)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to perform budget analysis")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency
    }).format(amount)
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600 dark:text-green-400'
    if (variance < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4" />
    if (variance < 0) return <TrendingDown className="w-4 h-4" />
    return <DollarSign className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Form */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Budget Input
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min={2020}
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Earnings</label>
                <Input
                  type="number"
                  value={formData.earnings}
                  onChange={(e) => setFormData(prev => ({ ...prev, earnings: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Budgeted Expenses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Budgeted Expenses</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExpense('budgeted_expenses')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.budgeted_expenses.map((expense, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Category"
                      value={expense.category}
                      onChange={(e) => updateExpense('budgeted_expenses', index, 'category', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) => updateExpense('budgeted_expenses', index, 'amount', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="w-32"
                    />
                    {formData.budgeted_expenses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExpense('budgeted_expenses', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actual Expenses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-black dark:text-gray-300">Actual Expenses</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addExpense('actual_expenses')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.actual_expenses.map((expense, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Category"
                      value={expense.category}
                      onChange={(e) => updateExpense('actual_expenses', index, 'category', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) => updateExpense('actual_expenses', index, 'amount', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="w-32"
                    />
                    {formData.actual_expenses.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExpense('actual_expenses', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              Analyze Budget
            </Button>
          </form>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
              <Button
                onClick={() => openChart(analysis)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                View Chart
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Budgeted</div>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(analysis.total_budgeted || 0)}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Actual</div>
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    {formatCurrency(analysis.total_actual || 0)}
                  </div>
                </div>
              </div>

              {/* Variance */}
              <div className={`p-4 rounded-lg border-2 ${
                (analysis.variance || 0) > 0 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : (analysis.variance || 0) < 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Variance</div>
                    <div className={`text-xl font-bold flex items-center gap-2 ${getVarianceColor(analysis.variance || 0)}`}>
                      {getVarianceIcon(analysis.variance || 0)}
                      {formatCurrency(Math.abs(analysis.variance || 0))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {(analysis.variance || 0) > 0 ? 'Under Budget' : (analysis.variance || 0) < 0 ? 'Over Budget' : 'On Budget'}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {analysis.summary && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Analysis</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {analysis.summary}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ====== Recent Analyses Section ====== */}
      <div className="mt-10 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Budget Analyses
          </h3>

          <div className="flex gap-2 items-center">
            <select
              value={searchQuery.month}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, month: e.target.value }))}
              className="p-2 rounded-lg border bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>

            <Input
              type="number"
              value={searchQuery.year}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, year: e.target.value }))}
              min={2020}
              className="w-24"
            />

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

      {recentAnalyses.length === 0 ? (
  <p className="text-sm text-gray-500 dark:text-gray-400">No recent analyses found.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {recentAnalyses.map((item: any, idx) => {
    const isOverBudget = (item.variance || 0) < 0;
    const varianceColor = isOverBudget
      ? 'text-red-600 dark:text-red-400'
      : 'text-blue-600 dark:text-blue-400';

    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: item.currency || formData.currency,
    }).format(item.total_actual);

    return (
      <div
        key={idx}
        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 hover:shadow-lg transition cursor-pointer"
        onClick={() => handleRecentBudgetClick(item)}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date(item.year, (item.month || 1) - 1).toLocaleString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className={`text-sm font-semibold ${varianceColor}`}>
            {item.variance > 0
              ? 'Under Budget'
              : item.variance < 0
              ? 'Over Budget'
              : 'On Budget'}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {formattedAmount}
        </div>
        {item.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
            {item.summary}
          </p>
        )}
      </div>
    );
  })}
</div>

)}
      </div>

      {/* ====== Chart Modal ====== */}
      {selectedAnalysis && (
        <AnalysisChartModal
          isOpen={isChartOpen}
          onClose={() => setIsChartOpen(false)}
          analysis={selectedAnalysis}
        />
      )}
    </div>
  )
}