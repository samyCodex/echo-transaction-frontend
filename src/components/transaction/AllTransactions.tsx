'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, TrendingUp, TrendingDown, Eye, Search, RefreshCw, Loader2 } from 'lucide-react'
import { transactionApi } from '@/lib/api'
import { TransactionDetailModal } from './TransactionDetailModal'

export function AllTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '' as '' | 'income' | 'expense',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0,
  })

  const currencies: { [key: string]: string } = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    INR: '₹', CAD: 'C$', AUD: 'A$', CHF: 'CHF', NGN: '₦',
  }

  const getCurrencySymbol = (code: string) => {
    return currencies[code] || code
  }

  useEffect(() => {
    loadTransactions()
  }, [filters.offset, filters.type, filters.startDate, filters.endDate])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await transactionApi.getAllTransactions({
        ...filters,
        type: filters.type || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      if (response.body) {
        setTransactions(response.body.transactions)
        setTotal(response.body.total)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      offset: 0, // Reset pagination when filters change
    }))
  }

  const handleNextPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }))
  }

  const handlePreviousPage = () => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      limit: 50,
      offset: 0,
    })
  }

  const currentPage = Math.floor(filters.offset / filters.limit) + 1
  const totalPages = Math.ceil(total / filters.limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Filters */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Transactions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {total} total transaction{total !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={loadTransactions}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">&nbsp;</label>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No transactions found</p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Clear Filters
              </Button>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
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
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {transaction.description}
                      </p>
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
                      {transaction.type === 'income' ? '+' : '-'}
                      {getCurrencySymbol(transaction.currency)}
                      {transaction.amount.toFixed(2)}
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
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} • Showing {transactions.length} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handlePreviousPage}
                  disabled={filters.offset === 0}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={filters.offset + filters.limit >= total}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onUpdate={() => loadTransactions()}
        />
      )}
    </div>
  )
}
