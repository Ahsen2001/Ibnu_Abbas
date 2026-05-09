import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail } from 'lucide-react'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { getRoleHomePath } from '../../routes/roleRedirect'

type LocationState = {
  from?: {
    pathname?: string
  }
}

function resolvePostLoginPath(fromPath: string | undefined, fallbackPath: string) {
  if (!fromPath) {
    return fallbackPath
  }

  const blockedPaths = new Set([
    '/unauthorized',
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
  ])

  if (blockedPaths.has(fromPath)) {
    return fallbackPath
  }

  return fromPath
}

function LoginPage() {
  const { isAuthenticated, login, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  if (isAuthenticated) {
    return <Navigate replace to={getRoleHomePath(role)} />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextFieldErrors: Record<string, string> = {}

    if (!email.trim()) {
      nextFieldErrors.email = 'Email is required.'
    }

    if (!password) {
      nextFieldErrors.password = 'Password is required.'
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setIsSubmitting(true)

    try {
      const redirectPath = await login({ email, password })
      navigate(resolvePostLoginPath(state?.from?.pathname, redirectPath), { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to login with those credentials.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-4 py-10">
      <AuthCard description="Access your college management workspace." title="Portal Login">
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <FormField
            error={fieldErrors.email}
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            suffix={<Mail size={16} />}
            type="email"
            value={email}
          />
          <FormField
            error={fieldErrors.password}
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            suffix={<LockKeyhole size={16} />}
            type="password"
            value={password}
          />
          {formError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
          <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <Link className="font-medium text-college-green hover:text-teal-800" to="/forgot-password">
              Forgot password?
            </Link>
            <Link className="font-medium text-college-green hover:text-teal-800" to="/register">
              Create account
            </Link>
          </div>
        </form>
      </AuthCard>
    </section>
  )
}

export default LoginPage
