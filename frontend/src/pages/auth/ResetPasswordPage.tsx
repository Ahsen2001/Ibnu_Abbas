import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, LockKeyhole, Mail } from 'lucide-react'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'

function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    email: searchParams.get('email') ?? '',
    token: '',
    password: '',
    passwordConfirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isReady = useMemo(() => Boolean(form.email.trim() && form.token.trim() && form.password), [form])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextFieldErrors: Record<string, string> = {}

    if (!form.email.trim()) nextFieldErrors.email = 'Email is required.'
    if (!form.token.trim()) nextFieldErrors.token = 'Reset token is required.'
    if (form.password.length < 8) nextFieldErrors.password = 'Password must be at least 8 characters.'
    if (form.passwordConfirmation !== form.password) nextFieldErrors.passwordConfirmation = 'Passwords do not match.'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setIsSubmitting(true)

    try {
      await resetPassword({
        email: form.email,
        token: form.token,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      })
      navigate('/login', { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to reset password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-lg items-center px-4 py-10">
      <AuthCard description="Enter the reset token sent by email and choose a new password." title="Reset Password">
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <FormField
            error={fieldErrors.email}
            label="Email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="name@example.com"
            suffix={<Mail size={16} />}
            type="email"
            value={form.email}
          />
          <FormField
            error={fieldErrors.token}
            hint="Paste the reset token from your email."
            label="Reset token"
            onChange={(event) => setForm((current) => ({ ...current, token: event.target.value }))}
            placeholder="Enter token"
            suffix={<KeyRound size={16} />}
            value={form.token}
          />
          <FormField
            error={fieldErrors.password}
            label="New password"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="New password"
            suffix={<LockKeyhole size={16} />}
            type="password"
            value={form.password}
          />
          <FormField
            error={fieldErrors.passwordConfirmation}
            label="Confirm new password"
            onChange={(event) => setForm((current) => ({ ...current, passwordConfirmation: event.target.value }))}
            placeholder="Repeat new password"
            suffix={<LockKeyhole size={16} />}
            type="password"
            value={form.passwordConfirmation}
          />
          {formError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
          <button className="btn-primary w-full" disabled={!isReady || isSubmitting} type="submit">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
          <p className="text-sm text-slate-500">
            Back to{' '}
            <Link className="font-medium text-college-green hover:text-teal-800" to="/login">
              login
            </Link>
          </p>
        </form>
      </AuthCard>
    </section>
  )
}

export default ResetPasswordPage
