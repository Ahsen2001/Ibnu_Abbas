import { api } from './api'

export type Role = {
  id: number
  name: string
  slug: string
}

export type AuthUser = {
  id: number
  name: string
  email: string
  phone?: string | null
  status: string
  preferred_locale: string
  role?: Role | null
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  phone?: string
  preferred_locale?: 'en' | 'ta' | 'ar'
  password: string
  password_confirmation: string
}

export type AuthResponse = {
  user: AuthUser
  token: string
  message?: string
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },
  me: async () => {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },
  logout: async () => {
    await api.post('/auth/logout')
  },
}
