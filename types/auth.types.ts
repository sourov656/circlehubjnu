// Auth Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  university?: string;
  studentId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth Response Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  university?: string;
  studentId?: string;
  phone?: string;
  verified: boolean;
  role: "student" | "admin" | "moderator" | "support_staff";
  created_at?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  university?: string;
  studentId?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: "Bearer";
}

export interface AuthSuccessResponse {
  message: string;
  user: UserProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export interface AuthErrorResponse {
  error: string;
  message?: string;
}

// Service Response Types (for internal use)
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}
