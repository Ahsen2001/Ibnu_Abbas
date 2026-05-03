import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setFieldError('Email is required.')
      return
    }

    setFieldError(null)
    setFormError(null)
    setIsSubmitting(true)

    try {
      await forgotPassword({ email })
      navigate(`/reset-password?email=${encodeURIComponent(email)}`, { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to send password reset instructions.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-4 py-10">
      <AuthCard description="Request a password reset token from the API and continue to the reset screen." title="Forgot Password">
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <FormField
            error={fieldError ?? undefined}
            hint="The backend emails a reset token to this address."
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            suffix={<Mail size={16} />}
            type="email"
            value={email}
          />
          {formError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
          <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Sending...' : 'Send Reset Token'}
          </button>
          <p className="text-sm text-slate-500">
            Remembered it?{' '}
            <Link className="font-medium text-college-green hover:text-teal-800" to="/login">
              Return to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </section>
  )
}

export default ForgotPasswordPage
