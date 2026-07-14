import { tokenStorage } from '../lib/token.storage'
import { createFetcherError } from './fetcher.error'
import type { ApiErrorResponse, RefreshResponse } from '@shared/types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }

  if (contentType?.includes('text/')) {
    return response.text() as Promise<T>
  }

  return null as T
}

async function tryRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      tokenStorage.clear()
      return false
    }

    const data: RefreshResponse = await response.json()

    tokenStorage.set(data.accessToken)
    return true
  } catch {
    tokenStorage.clear()
    return false
  }
}

async function refreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = tryRefresh().finally(() => {
    isRefreshing = false
    refreshPromise = null
  })

  return refreshPromise
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: Record<string, any>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, query, headers: customHeaders, ...restOptions } = options



  let headers: Record<string, string> = {}

  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  headers = {
    ...headers,
    ...(customHeaders as Record<string, string>),
  }

  const token = tokenStorage.get()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include',
  }

  if (body !== undefined) config.body = isFormData ? body as FormData : JSON.stringify(body)

  const queryString = query
    ? '?' + new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      )
    : ''

  const url = `${BASE_URL}${endpoint}${queryString}`

  let response: Response

  try {
    response = await fetch(url, config)
  } catch {
    throw createFetcherError(0, 'NETWORK_ERROR', 'Network error')
  }

  // 401 — пробуем refresh
  if (response.status === 401) {
    const refreshed = await refreshToken()

    if (refreshed) {
      const newToken = tokenStorage.get()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
      }

      try {
        response = await fetch(url, { ...config, headers })
      } catch {
        throw createFetcherError(0, 'NETWORK_ERROR', 'Network error')
      }
    }
  }

  if (!response.ok) {
    let apiError: ApiErrorResponse | null = null

    try {
      apiError = await parseResponse<ApiErrorResponse>(response)
    } catch {
      // не смогли распарсить
    }

    throw createFetcherError(
      response.status,
      apiError?.error?.code || 'UNKNOWN_ERROR',
      apiError?.error?.message || `Request failed with status ${response.status}`
    )
  }

  return parseResponse<T>(response)
}

export const fetcher = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  refreshToken,
}
