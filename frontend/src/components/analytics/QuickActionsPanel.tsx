import { ArrowRight, BellRing, FileText, Mail, PlusCircle, RefreshCw, Send, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Skeleton from '../Skeleton'
import type { EmailStatsResponse } from '../../services/analyticsService'

type QuickActionsPanelProps = {
  emailStats: EmailStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

const actions = [
  {
    label: 'Add Student',
    description: 'Create or enroll a new student record.',
    to: '/admin/students',
    icon: UserPlus,
  },
  {
    label: 'Review Applications',
    description: 'Open the admissions queue for review.',
    to: '/admin/applications',
    icon: FileText,
  },
  {
    label: 'Send Announcement',
    description: 'Publish a new notice for staff or students.',
    to: '/admin/announcements',
    icon: BellRing,
  },
  {
    label: 'Mark Attendance',
    description: 'Jump into the attendance overview and follow-up flow.',
    to: '/admin/attendance',
    icon: PlusCircle,
  },
  {
    label: 'Generate Report',
    description: 'Open the reporting screen for attendance exports.',
    to: '/admin/attendance/report',
    icon: Send,
  },
]

function QuickActionsPanel({ emailStats, isLoading, error, onRefresh }: QuickActionsPanelProps) {
  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Operations</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Quick Actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Shortcuts into the admin workflows your team uses most often.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link className="rounded-xl border border-slate-200 px-4 py-4 transition hover:border-college-green hover:bg-teal-50" key={action.to} to={action.to}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-college-green">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 font-semibold text-college-ink">{action.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
                </div>
                <ArrowRight className="mt-1 text-slate-400" size={16} />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <Mail className="text-college-green" size={16} />
          <h3 className="font-semibold text-college-ink">Email Delivery Snapshot</h3>
        </div>

        {error && !emailStats ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        {isLoading && !emailStats ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : null}

        {emailStats ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sent</p>
              <strong className="mt-2 block text-2xl font-bold text-emerald-700">{emailStats.totals.sent}</strong>
            </div>
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Failed</p>
              <strong className="mt-2 block text-2xl font-bold text-rose-700">{emailStats.totals.failed}</strong>
            </div>
            <div className="rounded-lg bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending</p>
              <strong className="mt-2 block text-2xl font-bold text-amber-700">{emailStats.totals.pending}</strong>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default QuickActionsPanel
