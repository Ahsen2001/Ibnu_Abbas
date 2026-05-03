import type { ApplicationStatus } from '../services/applicationService'

const statusClasses: Record<ApplicationStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-sky-100 text-sky-700',
  under_review: 'bg-amber-100 text-amber-800',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  offered: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-stone-200 text-stone-700',
}

type StatusBadgeProps = {
  status: ApplicationStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-chip ${statusClasses[status]}`}>
      {status.replaceAll('_', ' ')}
    </span>
  )
}

export default StatusBadge
