import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  value: string
  detail: string
  icon: ReactNode
}

function DashboardCard({ title, value, detail, icon }: DashboardCardProps) {
  return (
    <article className="panel p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-college-green">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <strong className="mt-1 block text-3xl font-bold text-college-ink">{value}</strong>
      <span className="mt-1 block text-sm text-slate-500">{detail}</span>
    </article>
  )
}

export default DashboardCard
