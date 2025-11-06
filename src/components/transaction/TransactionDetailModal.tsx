'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Calendar, DollarSign, User, FileText, CreditCard, Clock, TrendingUp, TrendingDown, Database, Edit, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transactionApi } from '@/lib/api'

interface TransactionDetailModalProps {
  transactionId: string
  onClose: () => void
  onUpdate?: () => void
}

export function TransactionDetailModal({ transactionId, onClose, onUpdate }: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    loadTransactionDetails()
  }, [transactionId])

  const loadTransactionDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await transactionApi.getTransactionById(transactionId)
      setTransaction(response.body)
      setEditForm({
        buyer_name: response.body.buyerName,
        description: response.body.description,
        date: response.body.date,
        amount: response.body.amount,
        type: response.body.type,
        currency: response.body.currency,
      })
    } catch (err: any) {
      console.error('Error loading transaction details:', err)
      setError(err.message || 'Failed to load transaction details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      buyer_name: transaction.buyerName,
      description: transaction.description,
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      currency: transaction.currency,
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await transactionApi.updateTransaction(transactionId, editForm)
      await loadTransactionDetails()
      setIsEditing(false)
      onUpdate?.() // Refresh parent list
    } catch (err: any) {
      console.error('Error updating transaction:', err)
      alert('Failed to update transaction: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await transactionApi.deleteTransaction(transactionId)
      onUpdate?.() // Refresh parent list
      onClose()
    } catch (err: any) {
      console.error('Error deleting transaction:', err)
      alert('Failed to delete transaction: ' + (err.message || 'Unknown error'))
      setIsDeleting(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCurrencySymbol = (code: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
      INR: '₹', CAD: 'C$', AUD: 'A$', CHF: 'CHF', NGN: '₦',
    }
    return symbols[code] || code
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          transaction?.type === 'income'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-red-500 to-rose-500'
        } text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {transaction?.type === 'income' ? (
                  <TrendingUp className="w-8 h-8" />
                ) : (
                  <TrendingDown className="w-8 h-8" />
                )}
                Transaction Details
              </h2>
              <p className="text-white/80 mt-1">{isEditing ? 'Edit Transaction' : 'View Details'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={loadTransactionDetails} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Edit Mode */}
              {isEditing ? (
                <div className="space-y-4">
                  {/* Type Toggle */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditForm({...editForm, type: 'income'})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        editForm.type === 'income'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5 inline mr-2" />
                      Income
                    </button>
                    <button
                      onClick={() => setEditForm({...editForm, type: 'expense'})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        editForm.type === 'expense'
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <TrendingDown className="w-5 h-5 inline mr-2" />
                      Expense
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {editForm.type === 'income' ? 'Buyer' : 'Seller/Vendor'}
                      </label>
                      <Input
                        value={editForm.buyer_name}
                        onChange={(e) => setEditForm({...editForm, buyer_name: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Currency</label>
                      <select
                        value={editForm.currency}
                        onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      >
                        {currencies.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} - {curr.name} ({curr.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
              <>
              {/* Amount Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
                <p className={`text-4xl font-bold ${
                  transaction.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {getCurrencySymbol(transaction.currency)}
                  {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Currency: {transaction.currency}
                </p>
              </div>

              {/* Transaction Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <p className="text-sm font-semibold">Description</p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{transaction.description}</p>
                </div>

                {/* Buyer/Seller */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4" />
                    <p className="text-sm font-semibold">
                      {transaction.type === 'income' ? 'Buyer' : 'Seller/Vendor'}
                    </p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{transaction.buyerName}</p>
                </div>

                {/* Transaction Date */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <p className="text-sm font-semibold">Transaction Date</p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(transaction.date)}</p>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <p className="text-sm font-semibold">Payment Method</p>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                    {transaction.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Database Metadata */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-3">
                  <Database className="w-5 h-5" />
                  <p className="font-semibold">Database Information</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Transaction ID</p>
                    <p className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">User ID</p>
                    <p className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">{transaction.userId}</p>
                  </div>
                  {transaction.businessId && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Business ID</p>
                      <p className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">{transaction.businessId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Created At</p>
                    <p className="text-gray-900 dark:text-gray-100 text-xs">{formatDateTime(transaction.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Transaction Type</p>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{transaction.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Original DB Amount</p>
                    <p className="text-gray-900 dark:text-gray-100 font-mono">{transaction.originalAmount}</p>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-center text-red-600 dark:text-red-400 font-semibold">
                Are you sure you want to delete this transaction?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4 mr-2" /> Delete</>
                  )}
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="flex gap-3">
              <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
