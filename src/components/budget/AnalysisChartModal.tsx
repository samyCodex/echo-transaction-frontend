'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'
import { BudgetAnalysisResult } from '@/lib/budget-api'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Tick,
  Scale
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface AnalysisChartModalProps {
  isOpen: boolean
  onClose: () => void
  analysis: BudgetAnalysisResult
}

export function AnalysisChartModal({ isOpen, onClose, analysis }: AnalysisChartModalProps) {
  const categories = Array.from(
    new Set([
      ...(analysis.budgeted_expenses?.map(e => e.category) || []),
      ...(analysis.actual_expenses?.map(e => e.category) || [])
    ])
  )

  const budgetedAmounts = categories.map(
    cat => analysis.budgeted_expenses?.find(e => e.category === cat)?.amount || 0
  )
  const actualAmounts = categories.map(
    cat => analysis.actual_expenses?.find(e => e.category === cat)?.amount || 0
  )
  const varianceAmounts = budgetedAmounts.map((b, i) => b - actualAmounts[i])

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Budgeted',
        data: budgetedAmounts,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
      },
      {
        label: 'Actual',
        data: actualAmounts,
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // purple
      },
      {
        label: 'Variance',
        data: varianceAmounts,
        backgroundColor: varianceAmounts.map(v =>
          v >= 0 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'
        ), // green/red
      }
    ]
  }

  // Determine locale based on currency
  const currencyLocaleMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    NGN: 'en-NG'
  }
  const locale = currencyLocaleMap[analysis.currency || 'USD'] || 'en-US'
  const currency = analysis.currency || 'USD'

  // ✅ Properly typed Chart.js options
  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${new Intl.NumberFormat(locale, {
              style: 'currency',
              currency
            }).format(context.raw as number)}`
        }
      },
      title: {
        display: true,
        text: 'Budget vs Actual vs Variance',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // ✅ Correct type-safe callback
          callback(this: Scale, tickValue: string | number, index: number, ticks: Tick[]) {
            if (typeof tickValue === 'number') {
              return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency
              }).format(tickValue)
            }
            return tickValue
          }
        }
      }
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detailed Budget Analysis
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full h-96">
                  <Bar data={data} options={options} />
                </div>

                {analysis.summary && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      AI Summary
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{analysis.summary}</div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
