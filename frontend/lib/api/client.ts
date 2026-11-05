// Requests are sent to the same origin; Next.js proxies /api/* → NEXT_PUBLIC_API_URL.
// This keeps cookies same-origin and avoids CORS issues in development and production.
import { toast } from 'sonner'

const API_BASE_URL = ''

const TOKEN_KEY = 'taskflow_token'
const USER_KEY = 'taskflow_user'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string>),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message ?? 'Something went wrong'
    console.error(message)
    if (typeof window !== 'undefined') toast.error(message)
    throw new ApiError(message, response.status)
  }

  const message = payload?.message
  if (message) {
    console.log(message)
    if (typeof window !== 'undefined' && init?.method && init.method !== 'GET') {
      toast.success(message)
    }
  }

  return payload as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
