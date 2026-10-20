import { api } from './client'
import type { ApiResponse, LoginInput, RegisterInput, UserProfile } from '@/lib/types/api'

export function register(input: RegisterInput) {
  return api.post<ApiResponse>('/api/auth/signup', input)
}

export function login(input: LoginInput) {
  return api.post<ApiResponse>('/api/auth/login', input)
}

export function getProfile() {
  return api.get<ApiResponse<UserProfile>>('/api/profile')
}
