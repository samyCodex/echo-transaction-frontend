// API Testing Utility - Remove in production
import { authApi } from './api';

export const testApiConnection = async () => {
  console.log('🔍 Testing API Connection...');
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1');
  
  try {
    // Test OTP send endpoint
    const testEmail = 'test@example.com';
    console.log('📧 Testing OTP send with email:', testEmail);
    
    const response = await authApi.sendOtp({ email: testEmail });
    console.log('✅ OTP Send Response:', response);
    
    return true;
  } catch (error: any) {
    console.error('❌ API Connection Failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    
    return false;
  }
};

// Helper to test individual endpoints
export const testEndpoints = {
  async sendOtp(email: string) {
    try {
      const response = await authApi.sendOtp({ email });
      console.log('✅ Send OTP Success:', response);
      return response;
    } catch (error) {
      console.error('❌ Send OTP Failed:', error);
      throw error;
    }
  },
  
  async verifyOtp(email: string, code: string) {
    try {
      const response = await authApi.verifyOtp({ email, code });
      console.log('✅ Verify OTP Success:', response);
      return response;
    } catch (error) {
      console.error('❌ Verify OTP Failed:', error);
      throw error;
    }
  },
  
  async login(email: string, password: string) {
    try {
      const response = await authApi.login({ email, password });
      console.log('✅ Login Success:', response);
      return response;
    } catch (error) {
      console.error('❌ Login Failed:', error);
      throw error;
    }
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testApi = {
    testConnection: testApiConnection,
    endpoints: testEndpoints,
  };
}
