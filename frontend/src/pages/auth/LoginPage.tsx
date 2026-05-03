import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppLogo from '../../components/AppLogo'
import { useAuth } from '../../context/AuthContext'

type LocationState = {
  from?: {
    pathname?: string
  }
}

function dashboardPath(role: string | null) {
  if (role === 'super_admin' || role === 'admin_staff') {
    return '/admin'
  }

  if (role === 'teacher') {
    return '/teacher'
  }

  if (role === 'student') {
    return '/student'
  }

  return '/applicant/applications'
}

function LoginPage() {
  const { isAuthenticated, login, role } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  if (isAuthenticated) {
    return <Navigate replace to={dashboardPath(role)} />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(state?.from?.pathname ?? '/admin', { replace: true })
    } catch {
      toast.error('Unable to login with those credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-4 py-10">
      <form className="panel w-full p-6" onSubmit={handleSubmit}>
        <div className="mb-6 text-college-ink">
          <AppLogo />
          <h1 className="mt-6 text-2xl font-bold">Portal Login</h1>
          <p className="mt-1 text-sm text-slate-500">Access your college management workspace.</p>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input className="form-input" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input className="form-input" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default LoginPage
