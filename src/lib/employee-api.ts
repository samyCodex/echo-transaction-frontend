import api from './api'

export interface Employee {
  id: string
  business_id: string
  user_id: string
  employee_role: 'admin' | 'manager' | 'employee' | 'accountant'
  status: 'active' | 'inactive' | 'pending'
  invited_by?: string
  invited_at?: string
  joined_at?: string
  firstname?: string
  lastname?: string
  email?: string
  business_name?: string
}

export interface InviteEmployeeDto {
  email: string
  employee_role: 'admin' | 'manager' | 'employee' | 'accountant'
  business_id: string
}

export interface EmployeeStats {
  total: number
  active: number
  pending: number
  inactive: number
}

export const employeeApi = {
  // Invite employee to business
  async inviteEmployee(data: InviteEmployeeDto) {
    const response = await api.post('/employees/invite', data)
    return response.data?.body || response.data
  },

  // Accept invitation
  async acceptInvitation(employeeId: string) {
    const response = await api.post('/employees/accept-invitation', {
      employee_id: employeeId
    })
    return response.data?.body || response.data
  },

  // Get business employees
  async getBusinessEmployees(businessId: string): Promise<Employee[]> {
    const response = await api.get(`/employees/business/${businessId}`)
    return response.data?.body || response.data
  },

  // Get user's businesses
  async getMyBusinesses(): Promise<Employee[]> {
    const response = await api.get('/employees/my-businesses')
    return response.data?.body || response.data
  },

  // Update employee role
  async updateEmployeeRole(businessId: string, employeeId: string, role: Employee['employee_role']) {
    const response = await api.put(`/employees/role?business_id=${businessId}`, {
      employee_id: employeeId,
      employee_role: role
    })
    return response.data?.body || response.data
  },

  // Remove employee
  async removeEmployee(businessId: string, employeeId: string) {
    const response = await api.delete(`/employees/${employeeId}?business_id=${businessId}`)
    return response.data?.body || response.data
  },

  // Deactivate employee
  async deactivateEmployee(businessId: string, employeeId: string) {
    const response = await api.put(`/employees/${employeeId}/deactivate?business_id=${businessId}`)
    return response.data?.body || response.data
  },

  // Get employee statistics
  async getEmployeeStats(businessId: string): Promise<EmployeeStats> {
    const response = await api.get(`/employees/stats/${businessId}`)
    return response.data?.body || response.data
  }
}
