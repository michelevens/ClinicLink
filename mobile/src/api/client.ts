import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const TOKEN_KEY = 'cliniclink_token'
const USER_KEY = 'cliniclink_user'

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || 'https://cliniclink.health/api'

type UnauthorizedCallback = () => void

let onUnauthorized: UnauthorizedCallback = () => {}

export function setOnUnauthorized(callback: UnauthorizedCallback) {
  onUnauthorized = callback
}

class ApiClient {
  private baseUrl: string
  private tokenCache: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async loadToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY)
      this.tokenCache = token
      return token
    } catch {
      return null
    }
  }

  async setToken(token: string): Promise<void> {
    this.tokenCache = token
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  }

  async clearToken(): Promise<void> {
    this.tokenCache = null
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      await SecureStore.deleteItemAsync(USER_KEY)
    } catch {
      // Ignore errors during cleanup
    }
  }

  async saveUser(user: unknown): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    } catch {
      // Ignore if too large for SecureStore
    }
  }

  async getSavedUser(): Promise<unknown | null> {
    try {
      const raw = await SecureStore.getItemAsync(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.loadToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      await this.clearToken()
      onUnauthorized()
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message =
        body.message || body.error || `Request failed (${res.status})`
      const error = new Error(message) as Error & {
        status: number
        errors: Record<string, string[]>
      }
      error.status = res.status
      error.errors = body.errors || {}
      throw error
    }

    if (res.status === 204) return {} as T
    return res.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint)
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await this.loadToken()
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (res.status === 401) {
      await this.clearToken()
      onUnauthorized()
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message =
        body.message || body.error || `Request failed (${res.status})`
      const error = new Error(message) as Error & {
        status: number
        errors: Record<string, string[]>
      }
      error.status = res.status
      error.errors = body.errors || {}
      throw error
    }

    if (res.status === 204) return {} as T
    return res.json()
  }

  async getDownloadUrl(path: string): Promise<string> {
    const token = await this.loadToken()
    const qs = new URLSearchParams()
    if (token) qs.set('token', token)
    return `${this.baseUrl}${path}?${qs}`
  }
}

export const api = new ApiClient(API_URL)
