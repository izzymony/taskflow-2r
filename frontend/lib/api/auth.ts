import { api, clearAuthToken, setAuthToken, setStoredUser } from './client'
import type { ApiResponse, LoginInput, RegisterInput, UserProfile } from '@/lib/types/api'

export async function register(input: RegisterInput) {
  const response = await api.post<ApiResponse<UserProfile>>('/api/auth/signup', input)
  if (response.token) {
    setAuthToken(response.token)
  }
  if (response.user) {
    setStoredUser(response.user)
  }
  return response
}

export async function login(input: LoginInput) {
  const response = await api.post<ApiResponse<UserProfile>>('/api/auth/login', input)
  if (response.token) {
    setAuthToken(response.token)
  }
  if (response.user) {
    setStoredUser(response.user)
  }
  return response
}

export async function getProfile() {
  const response = await api.get<ApiResponse<UserProfile>>('/api/profile')
  if (response.data) {
    setStoredUser(response.data)
  }
  return response
}

export function logout() {
  clearAuthToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/signin'
  }
}
