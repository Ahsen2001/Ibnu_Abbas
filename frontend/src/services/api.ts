import axios from 'axios'

const API_TOKEN_KEY = 'iaac_auth_token'
let activeRequestCount = 0

function emitNetworkActivity() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent('network:activity', { detail: { count: activeRequestCount } }))
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  activeRequestCount += 1
  emitNetworkActivity()

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && 'Content-Type' in config.headers) {
      delete config.headers['Content-Type']
    }
  }

  const token = localStorage.getItem(API_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    activeRequestCount = Math.max(0, activeRequestCount - 1)
    emitNetworkActivity()

    return response
  },
  (error) => {
    activeRequestCount = Math.max(0, activeRequestCount - 1)
    emitNetworkActivity()

    if (error.response?.status === 401) {
      localStorage.removeItem(API_TOKEN_KEY)
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  },
)

export const tokenStorage = {
  key: API_TOKEN_KEY,
  get: () => localStorage.getItem(API_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(API_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(API_TOKEN_KEY),
}
