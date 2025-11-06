import axios from 'axios';
import type {
  ApiResponse,
  OtpRequest,
  OtpVerifyRequest,
  OtpVerifyResponse,
  PersonalRegistrationRequest,
  BusinessRegistrationRequest,
  LoginRequest,
  AuthResponse,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

console.log(' Using API Base URL: ', process.env.NEXT_PUBLIC_API_URL)  
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',  
  },
}); 

// Request interceptor to add auth token and logging
api.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });
  }
  
  return config;
});

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Add logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Skip logging for optional feature endpoints (403 Forbidden, 402 Payment Required)
    const isOptionalFeature = error.config?.url?.includes('/forecast') || 
                               error.config?.url?.includes('/anomalies')
    const expectedError = error.response?.status === 403 || error.response?.status === 402
    
    // Add error logging for debugging (skip expected optional feature errors)
    if (process.env.NODE_ENV === 'development' && !(isOptionalFeature && expectedError)) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const chatApi = {
  // Send a prompt/message to the AI
  sendPrompt: async (data: { prompt: string; conversation_id?: string }) => {
    const response = await api.post('/prompt/send', data);
    return response.data;
  },

  // Get all conversations for the user
  getConversations: async () => {
    const response = await api.get('/prompt/conversations');
    return response.data;
  },

  // Get a specific conversation by ID
  getConversation: async (id: string) => {
    const response = await api.get(`/prompt/conversations/${id}`);
    return response.data;
  },

  // Get message history for a conversation
  getMessageHistory: async (conversationId: string) => {
    const response = await api.get(`/prompt/conversations/${conversationId}/messages`);
    return response.data;
  },
};

export const transactionApi = {
  // Create a new transaction
  createTransaction: async (data: {
    buyer_name: string;
    description: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    currency?: string;
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  // Get recent transactions
  getRecentTransactions: async (limit: number = 5) => {
    const response = await api.get(`/transactions/recent?limit=${limit}`);
    return response.data;
  },

  // Get all transactions with filters
  getAllTransactions: async (filters?: {
    limit?: number;
    offset?: number;
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // Get single transaction by ID
  getTransactionById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Update a transaction
  updateTransaction: async (id: string, data: {
    buyer_name?: string;
    description?: string;
    date?: string;
    amount?: number;
    type?: 'income' | 'expense';
    currency?: string;
  }) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get AI suggestion for a transaction
  getAiSuggestion: async (prompt: string) => {
    const response = await api.post('/prompt/send', { 
      prompt,
      conversation_id: undefined 
    });
    return { body: { suggestion: response.data.body?.response || '' } };
  },
};

export const authApi = {
  // OTP Operations
  sendOtp: async (data: OtpRequest): Promise<ApiResponse<{ email: string; otp?: string }>> => {
    const response = await api.post('/auth/otp/send', data);
    return response.data;
  },

  resendOtp: async (data: OtpRequest): Promise<ApiResponse<{ email: string }>> => {
    const response = await api.post('/auth/otp/resend', data);
    return response.data;
  },

  verifyOtp: async (data: OtpVerifyRequest): Promise<ApiResponse<OtpVerifyResponse>> => {
    try {
      const response = await api.post('/auth/otp/verify', data);
      return response.data;
    } catch (error: any) {
      // For OTP verification, we want to handle 400 responses as valid responses
      // since they contain the verification result
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Registration
  registerPersonal: async (data: PersonalRegistrationRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Handle 400 responses for registration errors
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  registerBusiness: async (data: BusinessRegistrationRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Handle 400 responses for registration errors
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Authentication
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      // Handle 400/401 responses for login errors
      if (error.response?.status === 400 || error.response?.status === 401) {
        return error.response.data;
      }
      throw error;
    }
  },
};

export default api;
