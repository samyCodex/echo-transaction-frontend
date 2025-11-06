export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  body?: T;
}

export interface OtpRequest {
  email: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface OtpVerifyResponse {
  verified: string | null;
}

export interface BusinessDetails {
  business_name: string;
  business_type: string;
  employee_count?: number;
}

export interface PersonalRegistrationRequest {
  sessionId: string;
  type: 'PERSONAL';
  firstname: string;
  lastname: string;
  password: string;
  confirm_password: string;
  ai_name?: string;
  ai_role?: string;
  // plan?: string;
}

export interface BusinessRegistrationRequest {
  sessionId: string;
  type: 'BUSINESS';
  firstname: string;
  lastname: string;
  password: string;
  confirm_password: string;
  ai_name?: string;
  ai_role?: string;
  business: BusinessDetails;
  plan?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role_id: string;
  type: 'PERSONAL' | 'BUSINESS';
  is_verified: boolean;
  ai_name?: string;
  ai_role?: string;
  business?: BusinessDetails;
  plan?: string;
}

export interface AuthResponse extends User {
  accessToken: string;
}
