import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Mail } from 'lucide-react'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
import { useAuth } from '../../context/AuthContext'
import { getRoleHomePath } from '../../routes/roleRedirect'
import { getApiErrorMessage } from '../../services/errorService'

function VerifyOtpPage() {
  const { pendingVerificationEmail, resendOtp, role, user, verifyOtp } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState(searchParams.get('email') ?? pendingVerificationEmail ?? user?.email ?? '')
  const [otpCode, setOtpCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (user?.email_verified_at) {
      navigate(getRoleHomePath(role), { replace: true })
    }
  }, [navigate, role, user?.email_verified_at])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextFieldErrors: Record<string, string> = {}

    if (!email.trim()) nextFieldErrors.email = 'Email is required.'
    if (otpCode.trim().length !== 6) nextFieldErrors.otpCode = 'Enter the 6-digit OTP code.'

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setIsSubmitting(true)

    try {
      await verifyOtp({ email, otp_code: otpCode })
      navigate(getRoleHomePath(role), { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'OTP verification failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: 'Enter your email first.' })
      return
    }

    setIsResending(true)
    setFormError(null)

    try {
      await resendOtp({ email })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to resend OTP.'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-md items-center px-4 py-10">
      <AuthCard description="Enter the verification code sent to your email to activate your applicant account." title="Verify OTP">
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
            error={fieldErrors.otpCode}
            hint="The code is valid for 10 minutes."
            label="OTP code"
            maxLength={6}
            onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            suffix={<KeyRound size={16} />}
            value={otpCode}
          />
          {formError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
          <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verifying...' : 'Verify Account'}
          </button>
          <button className="btn-secondary w-full" disabled={isResending} onClick={handleResend} type="button">
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
          <p className="text-sm text-slate-500">
            Need to sign in instead?{' '}
            <Link className="font-medium text-college-green hover:text-teal-800" to="/login">
              Return to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </section>
  )
}

export default VerifyOtpPage
