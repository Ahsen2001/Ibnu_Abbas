import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { ReactNode } from 'react'
import type { AuthUser, ForgotPasswordPayload, LoginPayload, OtpPayload, RegisterPayload, ResetPasswordPayload } from '../services/authService'
import { authService } from '../services/authService'
import { tokenStorage } from '../services/api'
import { getRoleHomePath } from '../routes/roleRedirect'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  role: string | null
  pendingVerificationEmail: string | null
  login: (payload: LoginPayload) => Promise<string>
  register: (payload: RegisterPayload) => Promise<string>
  verifyOtp: (payload: OtpPayload) => Promise<void>
  resendOtp: (payload: ForgotPasswordPayload) => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>
  logout: () => Promise<void>
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)
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
    return getRoleHomePath(response.user.role?.slug ?? null)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    tokenStorage.set(response.token)
    setToken(response.token)
    setUser(response.user)
    setPendingVerificationEmail(response.user.email)
    toast.success(response.message ?? 'Registration successful')
    return '/verify-otp'
  }, [])

  const verifyOtp = useCallback(async (payload: OtpPayload) => {
    const response = await authService.verifyOtp(payload)
    setUser(response.user)
    setPendingVerificationEmail(null)
    toast.success(response.message)
  }, [])

  const resendOtp = useCallback(async (payload: ForgotPasswordPayload) => {
    const response = await authService.resendOtp(payload)
    setPendingVerificationEmail(payload.email)
    toast.success(response.message)
  }, [])

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    const response = await authService.forgotPassword(payload)
    toast.success(response.message)
  }, [])

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    const response = await authService.resetPassword(payload)
    toast.success(response.message)
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
      pendingVerificationEmail,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      logout,
      hasRole: (roles: string[]) => Boolean(role && roles.includes(role)),
    }),
    [forgotPassword, isLoading, login, logout, pendingVerificationEmail, register, resendOtp, resetPassword, role, token, user, verifyOtp],
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
