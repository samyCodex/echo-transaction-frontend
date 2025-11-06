import api from './api'

export interface Transaction {
  id: string
  business_id: string
  employee_id?: string
  transaction_type: 'sale' | 'refund' | 'payment' | 'expense'
  amount: number
  currency: string
  category?: string
  description?: string
  customer_name?: string
  status: string
  transaction_date: string
}

export interface EmployeeGoal {
  id: string
  employee_id: string
  business_id: string
  goal_type: string
  title: string
  description?: string
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  status: string
  reward_points: number
}

export interface BusinessOverview {
  totalRevenue: number
  revenueGrowth: number
  totalTransactions: number
  transactionsGrowth: number
  activeEmployees: number
  topPerformers: Array<{
    employee_id: string
    name: string
    sales: number
    performance_score: number
  }>
  recentTransactions: Transaction[]
  aiInsights: string[]
}

export interface EmployeeDashboard {
  personalSales: number
  salesGrowth: number
  transactionsCount: number
  performanceScore: number
  rank: number
  totalEmployees: number
  activeGoals: EmployeeGoal[]
  recentTransactions: Transaction[]
  aiTips: string[]
}

export const businessMetricsApi = {
  // Business Owner APIs
  async getBusinessOverview(businessId: string): Promise<BusinessOverview> {
    const response = await api.get(`/business-metrics/overview/${businessId}`)
    return response.data?.body || response.data
  },

  async createTransaction(businessId: string, data: {
    transaction_type: 'sale' | 'refund' | 'payment' | 'expense'
    amount: number
    currency?: string
    category?: string
    description?: string
    customer_name?: string
    employee_id?: string
  }) {
    const response = await api.post(`/business-metrics/transactions/${businessId}`, data)
    return response.data?.body || response.data
  },

  async getBusinessTransactions(businessId: string, limit?: number): Promise<Transaction[]> {
    const response = await api.get(`/business-metrics/transactions/${businessId}`, {
      params: { limit }
    })
    return response.data?.body || response.data
  },

  async getTopPerformers(businessId: string, limit: number = 5) {
    const response = await api.get(`/business-metrics/top-performers/${businessId}`, {
      params: { limit }
    })
    return response.data?.body || response.data
  },

  // Employee APIs
  async getEmployeeDashboard(employeeId: string, businessId: string): Promise<EmployeeDashboard> {
    const response = await api.get(`/business-metrics/employee-dashboard/${employeeId}/${businessId}`)
    return response.data?.body || response.data
  },

  async getEmployeeTransactions(employeeId: string, limit?: number): Promise<Transaction[]> {
    const response = await api.get(`/business-metrics/employee-transactions/${employeeId}`, {
      params: { limit }
    })
    return response.data?.body || response.data
  },

  // Goals APIs
  async createGoal(businessId: string, data: {
    employee_id: string
    goal_type: 'sales_target' | 'transactions_count' | 'revenue_target' | 'custom'
    title: string
    description?: string
    target_value: number
    start_date: Date | string
    end_date: Date | string
    reward_points?: number
  }) {
    const response = await api.post(`/business-metrics/goals/${businessId}`, data)
    return response.data?.body || response.data
  },

  async getEmployeeGoals(employeeId: string): Promise<EmployeeGoal[]> {
    const response = await api.get(`/business-metrics/goals/${employeeId}`)
    return response.data?.body || response.data
  },

  async updateGoalProgress(goalId: string, currentValue: number) {
    const response = await api.put('/business-metrics/goals/progress', {
      goal_id: goalId,
      current_value: currentValue
    })
    return response.data?.body || response.data
  }
}
