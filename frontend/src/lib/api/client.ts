import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/domain'
import { useAuthStore } from '@/stores/auth'
import { endpoints } from './endpoints'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const http = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const { tokens, user } = useAuthStore.getState()
  if (tokens?.access) config.headers.Authorization = `Bearer ${tokens.access}`
  config.headers['Accept-Language'] = user?.locale ?? document.documentElement.lang ?? 'ar'
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { tokens, setTokens, logout } = useAuthStore.getState()
  if (!tokens?.refresh) return null
  try {
    const { data } = await axios.post<{ access: string }>(`${API_URL}${endpoints.auth.refresh}`, {
      refresh: tokens.refresh,
    })
    setTokens({ ...tokens, access: data.access })
    return data.access
  } catch {
    logout()
    return null
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      refreshing ??= refreshAccessToken().finally(() => (refreshing = null))
      const access = await refreshing
      if (access) {
        original.headers.Authorization = `Bearer ${access}`
        return http(original)
      }
    }
    return Promise.reject(toApiError(error))
  },
)

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as (Partial<ApiError> & { detail?: string }) | undefined
    return {
      status: error.response?.status ?? 0,
      code: data?.code ?? (error.response ? 'http_error' : 'network_error'),
      message: data?.message ?? data?.detail ?? error.message,
      fields: data?.fields,
    }
  }
  return { status: 0, code: 'unknown', message: String(error) }
}
