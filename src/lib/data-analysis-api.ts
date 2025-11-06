import api from './api'

// Types matching the backend DataAnalysisService
export interface PeriodInput {
  month?: number
  year: number
}

export interface AnalysisResult {
  ai_name?: string
  period?: string
  summary: string
  totals?: {
    totalEarnings: number
    totalActual: number
    totalBudgeted: number
    overallVariance: number
  }
  data_points?: any[]
  comparison?: any
  periodsAnalyzed?: number
  records?: any[]
  insight?: any
  message?: string
}

export interface SpendingPattern {
  category: string
  avgAmount: number
  trend: 'increasing' | 'decreasing' | 'stable'
  percentageOfTotal: number
}

export interface BudgetHealthScore {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  factors: {
    savingsRate: number
    budgetAdherence: number
    spendingConsistency: number
    earningsStability: number
  }
  recommendations: string[]
}

export interface ForecastResult {
  forecast: Array<{
    month: number
    year: number
    predictedExpenses: number
    confidence: 'high' | 'medium' | 'low'
  }>
  methodology: string
}

export const dataAnalysisApi = {
  /**
   * Analyzes historical budget data for a user over a specified period
   */
  async analyzeHistoricalBudgets(
    period: 'year' | 'month' = 'month',
    useCache: boolean = true
  ): Promise<AnalysisResult> {
    const response = await api.get('/monthly-analysis/historical', {
      params: { period, useCache }
    })
    return response.data?.body || response.data
  },

  /**
   * Compares budget data between two periods
   */
  async comparePeriods(
    firstPeriod: PeriodInput,
    secondPeriod: PeriodInput,
    currency: string = 'USD',
    useCache: boolean = true
  ): Promise<AnalysisResult> {
    const response = await api.post('/monthly-analysis/compare', {
      firstPeriod,
      secondPeriod,
      currency,
      useCache
    })
    return response.data?.body || response.data
  },

  /**
   * Analyzes budget trends across multiple periods
   */
  async analyzeMultiplePeriods(
    periods: PeriodInput[],
    currency: string = 'USD',
    useCache: boolean = true
  ): Promise<AnalysisResult> {
    const response = await api.post('/monthly-analysis/multi-period', {
      periods,
      currency,
      useCache
    })
    return response.data?.body || response.data
  },

  /**
   * Generates a 12-month rolling analysis
   */
  async analyzeLast12Months(
    endYear?: number,
    endMonth?: number,
    currency: string = 'USD'
  ): Promise<AnalysisResult> {
    const now = new Date()
    const year = endYear || now.getFullYear()
    const month = endMonth || now.getMonth() + 1
    
    const response = await api.get('/monthly-analysis/last-12-months', {
      params: { year, month, currency }
    })
    return response.data?.body || response.data
  },

  /**
   * Compares current period with same period last year
   */
  async compareYearOverYear(
    currentYear?: number,
    currentMonth?: number,
    currency: string = 'USD'
  ): Promise<AnalysisResult> {
    const now = new Date()
    const year = currentYear || now.getFullYear()
    const month = currentMonth || now.getMonth() + 1
    
    const response = await api.get('/monthly-analysis/year-over-year', {
      params: { year, month, currency }
    })
    return response.data?.body || response.data
  },

  /**
   * Analyzes quarterly performance
   */
  async analyzeQuarter(
    year: number,
    quarter: number,
    currency: string = 'USD'
  ): Promise<AnalysisResult> {
    const response = await api.get('/monthly-analysis/quarter', {
      params: { year, quarter, currency }
    })
    return response.data?.body || response.data
  },

  /**
   * Identifies spending patterns and anomalies
   */
  async identifySpendingPatterns(
    months: number = 6
  ): Promise<{
    patterns: SpendingPattern[]
    anomalies: any[]
    insights: string[]
  }> {
    const response = await api.get('/monthly-analysis/spending-patterns', {
      params: { months }
    })
    return response.data?.body || response.data
  },

  /**
   * Calculates budget health score
   */
  async calculateBudgetHealthScore(
    months: number = 3
  ): Promise<BudgetHealthScore> {
    const response = await api.get('/monthly-analysis/health-score', {
      params: { months }
    })
    return response.data?.body || response.data
  },

  /**
   * Forecasts future spending based on historical data
   */
  async forecastSpending(
    monthsToForecast: number = 3
  ): Promise<ForecastResult> {
    const response = await api.get('/monthly-analysis/forecast', {
      params: { monthsToForecast }
    })
    return response.data?.body || response.data
  },

  /**
   * Clears cache for data analysis
   */
  async clearCache(): Promise<void> {
    await api.post('/monthly-analysis/clear-cache')
  }
}
