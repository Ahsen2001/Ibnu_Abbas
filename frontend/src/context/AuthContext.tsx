import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import type { ReactNode } from 'react'
import type { AuthUser, LoginPayload, RegisterPayload } from '../services/authService'
import { authService } from '../services/authService'
import { tokenStorage } from '../services/api'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  role: string | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      clearSession()
      toast.error('Your session expired. Please login again.')
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [clearSession])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    authService
      .me()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setIsLoading(false))
  }, [clearSession, token])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    tokenStorage.set(response.token)
    setToken(response.token)
    setUser(response.user)
    toast.success('Login successful')
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    tokenStorage.set(response.token)
    setToken(response.token)
    setUser(response.user)
    toast.success(response.message ?? 'Registration successful')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearSession()
      toast.success('Logged out')
    }
  }, [clearSession])

  const role = user?.role?.slug ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      role,
      login,
      register,
      logout,
      hasRole: (roles: string[]) => Boolean(role && roles.includes(role)),
    }),
    [isLoading, login, logout, register, role, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
