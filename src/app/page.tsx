'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Shield, TrendingUp, Users, BarChart3, Sparkles, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800 animate-fade-in">
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center animate-float">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echo Ledger
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/demo" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold">
                Demo
              </Link>
              <Link href="/auth/account-type" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Pricing
              </Link>
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Sign In
              </Link>
              <Link href="/auth/account-type">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform duration-200">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}>
            <Sparkles className="w-4 h-4" />
            AI-Powered Financial Management
          </div>
          <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Manage Your Business
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              With Intelligence
            </span>
          </h1>
          <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Track transactions, manage employees, get AI-powered insights, and grow your business effortlessly.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <Link href="/auth/account-type">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-2xl text-lg px-8 py-6 transition-all duration-300">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 hover:shadow-lg transition-all duration-300 border-2">
                <Sparkles className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </Link>
            <Link href="/auth/account-type">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 hover:shadow-lg transition-all duration-300">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Trusted Partners / Sponsors Section */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-8">
            TRUSTED BY LEADING COMPANIES
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <style jsx>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 40s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {[
              { name: 'Microsoft', icon: '🏢' },
              { name: 'Google', icon: '🔍' },
              { name: 'Amazon', icon: '📦' },
              { name: 'Apple', icon: '🍎' },
              { name: 'Meta', icon: '👁️' },
              { name: 'Tesla', icon: '⚡' },
              // Duplicate for seamless loop
              { name: 'Microsoft', icon: '🏢' },
              { name: 'Google', icon: '🔍' },
              { name: 'Amazon', icon: '📦' },
              { name: 'Apple', icon: '🍎' },
              { name: 'Meta', icon: '👁️' },
              { name: 'Tesla', icon: '⚡' },
            ].map((company, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 mx-8 flex flex-col items-center justify-center group opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-300 shadow-md backdrop-blur-sm filter blur-[0.5px] group-hover:blur-0">
                  {company.icon}
                </div>
                <p className="mt-2 text-[10px] font-semibold text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors blur-[0.3px] group-hover:blur-0">
                  {company.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed for modern businesses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Insights',
                description: 'Get intelligent recommendations and forecasts powered by Gemini AI',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: TrendingUp,
                title: 'Revenue Tracking',
                description: 'Monitor your business performance with real-time analytics and growth metrics',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Team Management',
                description: 'Manage employees, track performance, and set goals effortlessly',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Visualize trends, detect anomalies, and make data-driven decisions',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Your data is protected with enterprise-grade encryption',
                color: 'from-red-500 to-rose-500'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Real-time updates and instant access to your business data',
                color: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Trusted by Growing Businesses</h2>
          <p className="text-xl text-white/90 mb-12">Join thousands of businesses already using Echo Ledger</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Users' },
              { number: '$2M+', label: 'Transactions Tracked' },
              { number: '99.9%', label: 'Uptime' },
              { number: '4.9/5', label: 'Customer Rating' }
            ].map((stat, idx) => (
              <div key={idx} className={`transition-all duration-500 hover:scale-110 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="text-5xl font-bold mb-2 animate-pulse">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            Ready to Transform Your Business?
          </h2>
          <p className={`text-xl text-gray-600 dark:text-gray-300 mb-8 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Start your free trial today. No credit card required.
          </p>
          <Link href="/auth/account-type">
            <Button size="lg" className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110 text-lg px-12 py-6 transition-all duration-300 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`} style={{ transitionDelay: '400ms' }}>
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Echo Ledger
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            AI-Powered Business Management Platform
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2025 Echo Ledger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
