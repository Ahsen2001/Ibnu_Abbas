import type { ReactNode } from 'react'
import AppLogo from './AppLogo'

type AuthCardProps = {
  title: string
  description: string
  children: ReactNode
}

function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="panel w-full p-6 sm:p-8">
      <div className="mb-6 text-college-ink">
        <AppLogo />
        <h1 className="mt-6 text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default AuthCard
