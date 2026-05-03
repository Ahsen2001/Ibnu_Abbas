import axios from 'axios'

const API_TOKEN_KEY = 'iaac_auth_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
