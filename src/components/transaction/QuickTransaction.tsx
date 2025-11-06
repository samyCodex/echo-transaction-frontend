'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Sparkles, DollarSign, Calendar, ShoppingBag, User, TrendingUp, TrendingDown, Loader2, Eye } from 'lucide-react'
import { transactionApi } from '@/lib/api'
import { TransactionDetailModal } from './TransactionDetailModal'

export function QuickTransaction() {
  const [formData, setFormData] = useState({
    buyerName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'income' as 'income' | 'expense',
    currency: 'USD'
  })

  // Popular currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  ]

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string>('')
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string
    buyerName: string
    description: string
    amount: number
    type: string
    date: string
    currency: string
  }>>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getAiSuggestions = async () => {
    if (!formData.description && !formData.buyerName) return

    setIsLoadingSuggestions(true)
    try {
      const prompt = `Based on this transaction: ${formData.buyerName ? `with ${formData.buyerName}` : ''} ${formData.description ? `for ${formData.description}` : ''}, suggest a category and provide brief financial advice.`
      
      const response = await transactionApi.getAiSuggestion(prompt)
      if (response.body?.suggestion) {
        setAiSuggestions(response.body.suggestion)
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) {
      alert('Please fill in the required fields (Amount and Description)')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await transactionApi.createTransaction({
        buyer_name: formData.buyerName || 'N/A',
        description: formData.description,
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type
      })

      if (response.success) {
        // Show success message
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)

        // Reset form
        setFormData({
          buyerName: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          type: 'income',
          currency: formData.currency // Keep the same currency
        })
        setAiSuggestions('')

        // Load recent transactions
        loadRecentTransactions()
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Failed to create transaction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionApi.getRecentTransactions(5)
      if (response.body) {
        setRecentTransactions(response.body)
      }
    } catch (error) {
      console.error('Error loading recent transactions:', error)
    }
  }

  // Load recent transactions on mount
  useState(() => {
    loadRecentTransactions()
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">Transaction Saved!</h4>
            <p className="text-sm text-green-700 dark:text-green-300">Your transaction has been recorded successfully.</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            Quick Transaction Entry
          </h3>
          <p className="text-emerald-50 mt-2">Record your income or expenses with AI-powered insights</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => handleInputChange('type', 'income')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Income
            </button>
            <button
              onClick={() => handleInputChange('type', 'expense')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                formData.type === 'expense'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              Expense
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer/Seller Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                {formData.type === 'income' ? 'Buyer Name' : 'Seller/Vendor Name'}
              </label>
              <Input
                value={formData.buyerName}
                onChange={(e) => handleInputChange('buyerName', e.target.value)}
                placeholder={formData.type === 'income' ? 'e.g., John Doe' : 'e.g., Walmart'}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={getAiSuggestions}
                placeholder={formData.type === 'income' ? 'e.g., Freelance project' : 'e.g., Groceries'}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Suggestions */}
          {(aiSuggestions || isLoadingSuggestions) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">AI Insights</h4>
                  {isLoadingSuggestions ? (
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing transaction...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-purple-800 dark:text-purple-300">{aiSuggestions}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={getAiSuggestions}
              variant="outline"
              className="flex-1 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              disabled={isLoadingSuggestions || (!formData.description && !formData.buyerName)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Suggestion
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.amount || !formData.description}
              className={`flex-1 ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
              } text-white shadow-lg`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save Transaction
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {transaction.buyerName} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`font-bold text-right ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{getCurrencySymbol(transaction.currency || 'USD')}{transaction.amount.toFixed(2)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      className="h-8 px-3 text-xs"
                      title="View full details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onUpdate={() => loadRecentTransactions()}
        />
      )}
    </div>
  )
}
