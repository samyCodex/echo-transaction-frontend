'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, X, Check, Sparkles, MessageCircle, Calculator, TrendingUp, Receipt, BarChart3, Users, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  const tourSteps = [
    {
      title: 'Welcome to Echo Ledger',
      description: 'Your AI-powered business management platform. Let\'s take a quick tour of the key features.',
      image: '💼',
      color: 'from-blue-500 to-purple-500',
      features: []
    },
    {
      title: 'AI Chat Assistant',
      description: 'Ask questions about your finances, get insights, and receive personalized recommendations powered by Gemini AI.',
      image: '🤖',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Natural language queries',
        'Real-time financial insights',
        'Smart recommendations',
        'Conversation history'
      ]
    },
    {
      title: 'Quick Transaction Entry',
      description: 'Add income and expenses quickly with our streamlined form. AI suggests categories and provides financial advice.',
      image: '💳',
      color: 'from-emerald-500 to-teal-500',
      features: [
        'Fast entry form',
        'Multi-currency support',
        'AI category suggestions',
        'Receipt attachments'
      ]
    },
    {
      title: 'Budget Analysis',
      description: 'Visualize your spending patterns, track budgets, and get AI-powered forecasts for better financial planning.',
      image: '📊',
      color: 'from-green-500 to-blue-500',
      features: [
        'Real-time budget tracking',
        'Visual charts & graphs',
        'Spending predictions',
        'Monthly comparisons'
      ]
    },
    {
      title: 'Data Analyst',
      description: 'Advanced analytics with anomaly detection, trend analysis, and detailed financial reports.',
      image: '📈',
      color: 'from-orange-500 to-red-500',
      features: [
        'Anomaly detection',
        'Trend forecasting',
        'Custom reports',
        'Export capabilities'
      ]
    },
    {
      title: 'Team Management',
      description: 'Manage employees, assign roles, track performance, and collaborate seamlessly with your team.',
      image: '👥',
      color: 'from-indigo-500 to-purple-500',
      features: [
        'Employee profiles',
        'Role-based access',
        'Performance tracking',
        'Team collaboration'
      ]
    },
    {
      title: 'Security & Privacy',
      description: 'Bank-level encryption, secure data storage, and complete privacy protection for your sensitive financial data.',
      image: '🔒',
      color: 'from-red-500 to-pink-500',
      features: [
        'End-to-end encryption',
        'Secure authentication',
        'Regular backups',
        'GDPR compliant'
      ]
    },
    {
      title: 'Ready to Get Started?',
      description: 'Start your free trial today and transform how you manage your business finances.',
      image: '🚀',
      color: 'from-blue-600 to-purple-600',
      features: [
        '14-day free trial',
        'No credit card required',
        'Cancel anytime',
        'Full feature access'
      ]
    }
  ]

  const startTour = () => {
    setIsPlaying(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    setCurrentStep(tourSteps.length - 1)
  }

  useEffect(() => {
    setShowTooltip(true)
    const timer = setTimeout(() => setShowTooltip(false), 5000)
    return () => clearTimeout(timer)
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echo Ledger
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Home
              </Link>
              <Link href="/auth/account-type">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Screen */}
          {!isPlaying ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6">
                <Sparkles className="w-4 h-4" />
                Interactive Product Tour
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Experience Echo Ledger
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  In Action
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                Take a guided tour through our AI-powered features and see how Echo Ledger can transform your business management.
              </p>
              <Button
                size="lg"
                onClick={startTour}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6 shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                Start Interactive Tour
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {/* Feature Preview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
                {[
                  { icon: MessageCircle, label: 'AI Chat', color: 'from-purple-500 to-pink-500' },
                  { icon: Receipt, label: 'Quick Entry', color: 'from-emerald-500 to-teal-500' },
                  { icon: Calculator, label: 'Budget', color: 'from-green-500 to-blue-500' },
                  { icon: TrendingUp, label: 'Analytics', color: 'from-orange-500 to-red-500' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Tour Content */
            <div className="relative">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Tour Step Content */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-right duration-500">
                <div className={`p-8 md:p-12 bg-gradient-to-br ${tourSteps[currentStep].color} text-white`}>
                  <div className="text-7xl mb-6 animate-bounce">{tourSteps[currentStep].image}</div>
                  <h2 className="text-4xl font-bold mb-4">{tourSteps[currentStep].title}</h2>
                  <p className="text-xl text-white/90">{tourSteps[currentStep].description}</p>
                </div>

                {/* Features List */}
                {tourSteps[currentStep].features.length > 0 && (
                  <div className="p-8 md:p-12">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Features:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tourSteps[currentStep].features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 animate-in slide-in-from-left duration-500"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 font-medium">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final CTA */}
                {currentStep === tourSteps.length - 1 && (
                  <div className="p-8 md:p-12 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <Link href="/auth/account-type">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6 shadow-xl hover:scale-105 transition-all"
                        >
                          Start Your Free Trial
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        No credit card required • 14-day free trial
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-6"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {tourSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep
                          ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></button>
                  ))}
                </div>
                {currentStep < tourSteps.length - 1 ? (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={skipTour} className="px-6">
                      Skip
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsPlaying(false)}
                    variant="outline"
                    className="px-6"
                  >
                    Restart Tour
                  </Button>
                )}
              </div>

              {/* Animated Tooltip */}
              {showTooltip && currentStep < tourSteps.length - 1 && (
                <div className="absolute -bottom-20 right-0 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                  <p className="text-sm font-semibold">👉 Click Next to continue</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
