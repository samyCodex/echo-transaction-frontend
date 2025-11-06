'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, TrendingDown, Activity, Calendar, GitCompare, AlertCircle, Loader2, Sparkles, X, Plus, BarChart3, Zap, Target, Brain } from 'lucide-react'
import { dataAnalysisApi, type SpendingPattern, type PeriodInput } from '@/lib/data-analysis-api'

type View = 'comparison' | 'multiPeriod' | 'patterns'

export function DataAnalyst() {
  const { user } = useAuth()
  const [view, setView] = useState<View>('comparison')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [p1Month, setP1Month] = useState('')
  const [p1Year, setP1Year] = useState('')
  const [p2Month, setP2Month] = useState('')
  const [p2Year, setP2Year] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [periods, setPeriods] = useState<PeriodInput[]>([])
  const [newMonth, setNewMonth] = useState('')
  const [newYear, setNewYear] = useState('')
  const [months, setMonths] = useState('6')
  const [patterns, setPatterns] = useState<{ patterns: SpendingPattern[], insights: string[] } | null>(null)

  const compare = async () => {
    if (!p1Year || !p2Year) { setError('Please enter years for both periods'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await dataAnalysisApi.comparePeriods(
        { year: parseInt(p1Year), month: p1Month ? parseInt(p1Month) : undefined },
        { year: parseInt(p2Year), month: p2Month ? parseInt(p2Month) : undefined }, currency
      )
      setResult(data)
    } catch (e: any) { 
      const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Failed to compare periods. Please ensure you have budget data for the selected periods.'
      setError(errorMsg)
    } finally { setLoading(false) }
  }

  const addPeriod = () => {
    if (!newYear) {
      setError('Please enter a year to add a period')
      return
    }
    const yearNum = parseInt(newYear)
    if (yearNum < 2000 || yearNum > 2099) {
      setError('Year must be between 2000 and 2099')
      return
    }
    if (newMonth) {
      const monthNum = parseInt(newMonth)
      if (monthNum < 1 || monthNum > 12) {
        setError('Month must be between 1 and 12')
        return
      }
    }
    setPeriods([...periods, { year: yearNum, month: newMonth ? parseInt(newMonth) : undefined }])
    setNewMonth('')
    setNewYear('')
    setError(null)
  }

  const analyzeMulti = async () => {
    if (periods.length < 2) { setError('Please add at least 2 periods to analyze'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await dataAnalysisApi.analyzeMultiplePeriods(periods, currency)
      setResult(data)
    } catch (e: any) { 
      const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Failed to analyze periods. Please ensure you have budget data for the selected periods.'
      setError(errorMsg)
    } finally { setLoading(false) }
  }

  const analyzePatterns = async () => {
    const m = parseInt(months)
    if (!m || m < 1 || m > 12) { setError('Please enter a valid number of months (1-12)'); return }
    setLoading(true); setError(null); setPatterns(null)
    try {
      const data = await dataAnalysisApi.identifySpendingPatterns(m)
      setPatterns(data)
    } catch (e: any) { 
      const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Failed to analyze spending patterns. Please ensure you have sufficient budget data.'
      setError(errorMsg)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#0F172A] text-gray-900 dark:text-white p-6">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-600/20 dark:to-blue-600/20 backdrop-blur-xl border border-purple-300 dark:border-purple-500/30 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-blue-200/50 dark:from-purple-600/10 dark:to-blue-600/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                Hello, {user?.firstname || 'User'} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Ready to manage your finances?</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Advanced Financial Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Deep insights into your spending patterns and budget performance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-8">
        {[
          { v: 'comparison', icon: GitCompare, label: 'Compare', gradient: 'from-purple-600 to-blue-600' },
          { v: 'multiPeriod', icon: Calendar, label: 'Multi-Period', gradient: 'from-pink-600 to-purple-600' },
          { v: 'patterns', icon: Sparkles, label: 'Patterns', gradient: 'from-blue-600 to-cyan-600' }
        ].map(({ v, icon: Icon, label, gradient }) => (
          <button key={v} onClick={() => { setView(v as View); setError(null); setResult(null); setPatterns(null) }}
            className={`flex-1 group relative overflow-hidden rounded-2xl p-6 font-semibold transition-all duration-300 ${
              view === v ? `bg-gradient-to-r ${gradient} text-white shadow-2xl scale-105` : 'bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
            }`}>
            <div className="flex items-center justify-center gap-3">
              <Icon className={`w-6 h-6 ${view === v ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
              <span className={view === v ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}>{label}</span>
            </div>
            {view === v && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/50 rounded-t-full" />}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-500/10 backdrop-blur-sm border border-red-200 dark:border-red-500/30 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-500/20"><AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" /></div>
            <div className="flex-1"><h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4><p className="text-sm text-red-700 dark:text-red-200">{error}</p></div>
            <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {view === 'comparison' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-blue-300/30 dark:from-purple-600/20 dark:to-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg"><GitCompare className="w-7 h-7 text-white" /></div>
                <div><h3 className="text-2xl font-bold text-gray-900 dark:text-white">Period Comparison</h3><p className="text-sm text-gray-600 dark:text-gray-400">Compare financial performance</p></div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { num: 1, title: 'First Period', month: p1Month, setMonth: setP1Month, year: p1Year, setYear: setP1Year, color: 'purple' },
                  { num: 2, title: 'Second Period', month: p2Month, setMonth: setP2Month, year: p2Year, setYear: setP2Year, color: 'blue' }
                ].map(({ num, title, month, setMonth, year, setYear, color }) => (
                  <div key={num} className="group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-6 hover:border-gray-300 dark:hover:border-white/20 transition-all">
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-${color}-400/20 to-${color}-600/20 dark:from-${color}-600/20 dark:to-${color}-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-700 flex items-center justify-center text-white font-bold text-xl shadow-lg`}>{num}</div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h4>
                      </div>
                      <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Month (Optional)</label>
                          <Input type="number" min="1" max="12" placeholder="1-12" value={month} onChange={(e) => setMonth(e.target.value)} 
                            className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 focus:border-purple-500 rounded-xl h-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Year *</label>
                          <Input type="number" min="2000" max="2099" placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} 
                            className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 focus:border-purple-500 rounded-xl h-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} 
                  className="px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:border-purple-500 focus:ring-0">
                  {['USD 🇺🇸', 'EUR 🇪🇺', 'GBP 🇬🇧', 'NGN 🇳🇬'].map(c => <option key={c.slice(0,3)} value={c.slice(0,3)} className="bg-gray-900">{c}</option>)}
                </select>
              </div>

              <Button onClick={compare} disabled={loading} 
                className="w-full h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all">
                {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" />Analyzing Your Data...</> : <><Zap className="w-6 h-6 mr-3" />Run Analysis</>}
              </Button>
            </div>
          </div>

          {result?.totals && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-600/20 dark:to-green-600/20 backdrop-blur-xl border border-emerald-300 dark:border-emerald-500/30 p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg"><BarChart3 className="w-7 h-7 text-white" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Complete</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Earnings', value: result.totals.totalEarnings, gradient: 'from-blue-500 to-cyan-600', icon: Target },
                    { label: 'Budgeted', value: result.totals.totalBudgeted, gradient: 'from-green-500 to-emerald-600', icon: Calendar },
                    { label: 'Actual', value: result.totals.totalActual, gradient: 'from-purple-500 to-pink-600', icon: Activity },
                    { label: 'Variance', value: Math.abs(result.totals.overallVariance || 0), gradient: result.totals.overallVariance >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-orange-600', icon: result.totals.overallVariance >= 0 ? TrendingUp : TrendingDown }
                  ].map(({ label, value, gradient, icon: Icon }) => (
                    <div key={label} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className="w-8 h-8 text-white/80 mb-3" />
                      <p className="text-sm text-white/90 font-medium mb-1">{label}</p>
                      <p className="text-2xl font-bold text-white">{currency} {value?.toLocaleString() || '0'}</p>
                    </div>
                  ))}
                </div>
                {result.summary && (
                  <div className="rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"><Sparkles className="w-6 h-6 text-white" /></div>
                      <div><h4 className="font-bold text-lg mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">AI Insights</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'multiPeriod' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg"><Calendar className="w-7 h-7 text-white" /></div>
              <div><h3 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Period Analysis</h3><p className="text-sm text-gray-600 dark:text-gray-400">Analyze multiple periods</p></div>
            </div>
            <div className="rounded-2xl bg-purple-100 dark:bg-purple-600/10 border border-purple-300 dark:border-purple-500/20 p-6 mb-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><Plus className="w-5 h-5" />Add Period</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <Input type="number" min="1" max="12" placeholder="Month (Optional)" value={newMonth} onChange={(e) => setNewMonth(e.target.value)} className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 rounded-xl h-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                <Input type="number" min="2000" max="2099" placeholder="Year (Required)" value={newYear} onChange={(e) => setNewYear(e.target.value)} className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 rounded-xl h-12 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white h-12 focus:ring-0 focus:border-purple-500">
                  {['USD', 'EUR', 'GBP', 'NGN'].map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                </select>
                <Button type="button" onClick={addPeriod} className="h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-5 h-5 mr-2" />Add Period
                </Button>
              </div>
            </div>
            {periods.length > 0 && (
              <div className="mb-6"><h4 className="font-bold mb-4 text-gray-900 dark:text-white">Selected: {periods.length}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {periods.map((p, i) => (
                    <div key={i} className="rounded-xl bg-purple-100 dark:bg-purple-600/20 border border-purple-300 dark:border-purple-500/30 p-4 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">{p.month ? `${p.month}/${p.year}` : p.year}</span>
                        <button onClick={() => setPeriods(periods.filter((_, idx) => idx !== i))} className="p-1 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={analyzeMulti} disabled={loading || periods.length < 2} className="w-full h-16 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-2xl dark:bg-gradient-to-r dark:from-pink-400 dark:to-purple-400 dark:hover:from-pink-300 dark:hover:to-purple-300">
              {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" />Analyzing...</> : <><Zap className="w-6 h-6 mr-3" />Analyze {periods.length} Periods</>}
            </Button>
          </div>
          {result?.totals && (
            <div className="rounded-3xl bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white"><BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />Results</h3>
              <div className="grid grid-cols-4 gap-4">
                {['Earnings', 'Budgeted', 'Actual', 'Variance'].map((label, i) => {
                  const values = [result.totals.totalEarnings, result.totals.totalBudgeted, result.totals.totalActual, Math.abs(result.totals.overallVariance || 0)]
                  const gradients = ['from-blue-500 to-cyan-600', 'from-green-500 to-emerald-600', 'from-purple-500 to-pink-600', result.totals.overallVariance >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-orange-600']
                  return <div key={label} className={`rounded-xl bg-gradient-to-br ${gradients[i]} p-5 shadow-lg dark:bg-gradient-to-br dark:from-blue-400 dark:to-cyan-400 dark:hover:from-blue-300 dark:hover:to-cyan-300`}>
                    <p className="text-sm text-white mb-1">{label}</p>
                    <p className="text-2xl font-bold text-white">{currency} {values[i]?.toLocaleString()}</p>
                  </div>
                })}
              </div>
              {result.summary && <div className="mt-6 p-5 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10"><p className="text-gray-700 dark:text-gray-300">{result.summary}</p></div>}
            </div>
          )}
        </div>
      )}

      {view === 'patterns' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg"><Sparkles className="w-7 h-7 text-white" /></div>
              <div><h3 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Patterns</h3><p className="text-sm text-gray-600 dark:text-gray-400">Identify trends</p></div>
            </div>
            <div className="mb-6"><label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Months (1-12)</label>
              <Input type="number" min="1" max="12" placeholder="6" value={months} onChange={(e) => setMonths(e.target.value)} className="max-w-xs h-12 rounded-xl bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" /></div>
            <Button onClick={analyzePatterns} disabled={loading} className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl">
              {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" />Analyzing...</> : <><Zap className="w-6 h-6 mr-3" />Analyze Patterns</>}
            </Button>
          </div>
          {patterns && patterns.insights.length > 0 && (
            <div className="rounded-3xl bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/30 p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">AI Insights</h3>
              {patterns.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20"><Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                  <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          )}
          {patterns && patterns.patterns.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">Patterns</h3>
              {patterns.patterns.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl mb-3 hover:border-gray-300 dark:hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    {p.trend === 'increasing' ? <TrendingUp className="w-5 h-5 text-red-400" /> : p.trend === 'decreasing' ? <TrendingDown className="w-5 h-5 text-green-400" /> : <Activity className="w-5 h-5 text-blue-400" />}
                    <div><p className="font-semibold text-gray-900 dark:text-white">{p.category}</p><p className="text-sm text-gray-600 dark:text-gray-400">{p.percentageOfTotal.toFixed(1)}%</p></div>
                  </div>
                  <div className="text-right"><p className="font-bold text-lg text-gray-900 dark:text-white">${p.avgAmount.toFixed(2)}</p><p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{p.trend}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
