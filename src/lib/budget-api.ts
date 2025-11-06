import api from './api'

export interface BudgetExpense {
  category: string
  amount: number
}

export interface BudgetAnalysisInput {
  currency: string
  month: number // 1-12
  year: number
  earnings: number
  budgeted_expenses: BudgetExpense[]
  actual_expenses: BudgetExpense[]
}

export interface BudgetAnalysisResult {
  id?: string
  user_id: string
  month: number
  year: number
  earnings: number
  currency: string
  budgeted_expenses: Array<{ id?: string; category: string; amount: number }>
  actual_expenses: Array<{ id?: string; category: string; amount: number }>
  total_budgeted?: number
  total_actual?: number
  variance?: number
  created_at?: string
  updated_at?: string
  summary?: string
  type?: string
  ai_name?: string
}

export interface BudgetInsight {
  id?: string
  budget_id: string
  user_id: string
  summary: string
  type: string
  ai_name?: string
  created_at?: string
}

export const budgetApi = {
  // Perform budget analysis
async performBudgetAnalysis(data: BudgetAnalysisInput): Promise<BudgetAnalysisResult> {
  const response = await api.post('/budget/analyze', data)
  const result = response.data?.body || response.data

  // Compute totals and variance for UI
  const total_budgeted = data.budgeted_expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const total_actual = data.actual_expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const variance = total_budgeted - total_actual

  return {
    id: result.id,
    user_id: result.user_id,
    month: data.month,
    year: data.year,
    earnings: data.earnings,
    currency: data.currency,
    budgeted_expenses: data.budgeted_expenses,
    actual_expenses: data.actual_expenses,
    total_budgeted,
    total_actual,
    variance,
    created_at: result.created_at,
    updated_at: result.updated_at,
    summary: result.summary,
    type: result.type,
    ai_name: result.ai_name,
  }
},

  // Search budgets by month/year
async searchBudgets(
  query: { month?: number; year?: number },
  user_id?: string
): Promise<BudgetAnalysisResult[]> {
  const response = await api.get("/budget/search", {
    params: { ...query, user_id },
  })

  // ✅ extract data correctly from backend response
  const result = response.data?.body || [] // fallback to empty array if no body
  return result
},
  // Get budget insights
  async getBudgetInsights(budgetId: string): Promise<BudgetInsight[]> {
    const response = await api.get(`/budget/${budgetId}/insights`)
    return response.data.data
  },

  // Delete budget
  async deleteBudget(budgetId: string): Promise<void> {
    await api.delete(`/budget/${budgetId}/delete`)
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/budget/${conversationId}/delete-conversation`)
  }
}
