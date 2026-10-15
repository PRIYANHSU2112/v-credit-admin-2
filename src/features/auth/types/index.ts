import type { UserProfile, UserRole } from '@/types/user'

export interface LoginRequest {
  identifier: string // mobile, email, or username
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  refreshToken?: string
  user: UserProfile
}

export interface AuthState {
  user: UserProfile | null
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
