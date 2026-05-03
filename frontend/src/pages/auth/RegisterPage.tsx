import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppLogo from '../../components/AppLogo'
import { useAuth } from '../../context/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))

    try {
      await register({
        name: String(form.get('name')),
        email: String(form.get('email')),
        phone: String(form.get('phone')),
        preferred_locale: 'en',
        password,
        password_confirmation: password,
      })
      navigate('/applicant/applications', { replace: true })
    } catch {
      toast.error('Registration failed. Please check the details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-xl items-center px-4 py-10">
      <form className="panel w-full p-6" onSubmit={handleSubmit}>
        <div className="mb-6 text-college-ink">
          <AppLogo />
          <h1 className="mt-6 text-2xl font-bold">Admission Registration</h1>
          <p className="mt-1 text-sm text-slate-500">Create an applicant account to start an application.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Full name
            <input className="form-input" name="name" required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input className="form-input" name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Phone
            <input className="form-input" name="phone" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
            Password
            <input className="form-input" minLength={8} name="password" required type="password" />
          </label>
          <button className="btn-primary sm:col-span-2" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default RegisterPage
