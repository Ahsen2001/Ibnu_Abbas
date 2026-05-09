import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BellRing,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Mail,
  RefreshCw,
  Users,
} from 'lucide-react'
import Skeleton from '../../components/Skeleton'
import {
  analyticsService,
  type AcademicStatsResponse,
  type AdmissionStatsResponse,
  type AnalyticsFilters,
  type AttendanceStatsResponse,
  type EmailStatsResponse,
  type HiflStatsResponse,
  type MonthlyTrendsResponse,
  type OverviewResponse,
  type StudentStatsResponse,
} from '../../services/analyticsService'
import { getApiErrorMessage } from '../../services/errorService'

type AnalyticsState<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
}

type OverviewCardProps = {
  title: string
  value: string
  detail: string
  icon: ReactNode
  accentClass: string
  iconClass: string
}

const AdmissionChart = lazy(() => import('../../components/analytics/AdmissionChart'))
const AcademicPerformanceChart = lazy(() => import('../../components/analytics/AcademicPerformanceChart'))
const AttendanceChart = lazy(() => import('../../components/analytics/AttendanceChart'))
const HiflProgressChart = lazy(() => import('../../components/analytics/HiflProgressChart'))
const MonthlyTrendChart = lazy(() => import('../../components/analytics/MonthlyTrendChart'))
const QuickActionsPanel = lazy(() => import('../../components/analytics/QuickActionsPanel'))
const StudentStatsChart = lazy(() => import('../../components/analytics/StudentStatsChart'))

function OverviewCard({ title, value, detail, icon, accentClass, iconClass }: OverviewCardProps) {
  return (
    <article className={`panel border-l-4 p-5 ${accentClass}`.trim()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block text-3xl font-bold text-college-ink">{value}</strong>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`.trim()}>
          {icon}
        </div>
      </div>
    </article>
  )
}

function SectionFallback({ height = 'min-h-[320px]' }: { height?: string }) {
  return (
    <section className={`panel p-5 ${height}`}>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-4 h-56 w-full" />
      <Skeleton className="mt-4 h-4 w-3/4" />
    </section>
  )
}

function useAnalyticsSection<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AnalyticsState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }))

    try {
      const data = await loader()
      setState({
        data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((current) => ({
        data: current.data,
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load this dashboard section.'),
      }))
    }
  }, [loader])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    ...state,
    refresh,
  }
}

function AdminDashboard() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useState<AnalyticsFilters>({
    year: undefined,
    department: '',
  })
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    [currentYear],
  )

  const loadOverview = useCallback(() => analyticsService.overview(filters), [filters])
  const loadAdmissions = useCallback(() => analyticsService.admissions(filters), [filters])
  const loadStudents = useCallback(() => analyticsService.students(filters), [filters])
  const loadAttendance = useCallback(() => analyticsService.attendance(filters), [filters])
  const loadAcademic = useCallback(() => analyticsService.academic(filters), [filters])
  const loadHifl = useCallback(() => analyticsService.hifl(filters), [filters])
  const loadEmail = useCallback(() => analyticsService.email(filters), [filters])
  const loadTrends = useCallback(() => analyticsService.trends(filters), [filters])

  const overview = useAnalyticsSection<OverviewResponse>(loadOverview)
  const admissions = useAnalyticsSection<AdmissionStatsResponse>(loadAdmissions)
  const students = useAnalyticsSection<StudentStatsResponse>(loadStudents)
  const attendance = useAnalyticsSection<AttendanceStatsResponse>(loadAttendance)
  const academic = useAnalyticsSection<AcademicStatsResponse>(loadAcademic)
  const hifl = useAnalyticsSection<HiflStatsResponse>(loadHifl)
  const email = useAnalyticsSection<EmailStatsResponse>(loadEmail)
  const trends = useAnalyticsSection<MonthlyTrendsResponse>(loadTrends)

  const overviewStats = overview.data?.stats

  const refreshAll = async () => {
    setIsRefreshingAll(true)

    try {
      await Promise.all([
        overview.refresh(),
        admissions.refresh(),
        students.refresh(),
        attendance.refresh(),
        academic.refresh(),
        hifl.refresh(),
        email.refresh(),
        trends.refresh(),
      ])
    } finally {
      setIsRefreshingAll(false)
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Analytics Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">College Performance Overview</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Live operational insight across admissions, student records, attendance, Shareea performance, Hifl progress, communication delivery, and monthly growth.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_180px_auto]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Year
            <select
              className="form-input"
              onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value ? Number(event.target.value) : undefined }))}
              value={filters.year ?? ''}
            >
              <option value="">All years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Department
            <select
              className="form-input"
              onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value as AnalyticsFilters['department'] }))}
              value={filters.department}
            >
              <option value="">All departments</option>
              <option value="shareea">Shareea</option>
              <option value="hifl">Hifl</option>
            </select>
          </label>
          <button className="btn-secondary min-h-11 self-end" disabled={isRefreshingAll} onClick={refreshAll} type="button">
            <RefreshCw className={isRefreshingAll ? 'animate-spin' : ''} size={16} />
            Refresh All
          </button>
        </div>
      </div>

      {overview.error && !overview.data ? (
        <section className="panel p-5">
          <p className="text-sm text-rose-600">{overview.error}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {overview.isLoading && !overview.data ? (
          Array.from({ length: 6 }, (_, index) => (
            <article className="panel p-5" key={`overview-skeleton-${index}`}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-20" />
              <Skeleton className="mt-3 h-4 w-32" />
            </article>
          ))
        ) : null}

        {overviewStats ? (
          <>
            <OverviewCard
              accentClass="border-l-emerald-500"
              detail="Currently active student records"
              icon={<GraduationCap className="text-emerald-700" size={20} />}
              iconClass="bg-emerald-50"
              title="Total Students"
              value={overviewStats.total_students.toLocaleString()}
            />
            <OverviewCard
              accentClass="border-l-blue-500"
              detail="Teachers in the selected scope"
              icon={<Users className="text-blue-700" size={20} />}
              iconClass="bg-blue-50"
              title="Total Teachers"
              value={overviewStats.total_teachers.toLocaleString()}
            />
            <OverviewCard
              accentClass="border-l-amber-500"
              detail="Submitted and in-progress admissions"
              icon={<FileText className="text-amber-700" size={20} />}
              iconClass="bg-amber-50"
              title="Pending Applications"
              value={overviewStats.pending_applications.toLocaleString()}
            />
            <OverviewCard
              accentClass="border-l-teal-500"
              detail="Based on today's marked records"
              icon={<ClipboardCheck className="text-teal-700" size={20} />}
              iconClass="bg-teal-50"
              title="Today's Attendance %"
              value={`${overviewStats.today_attendance_percentage.toFixed(1)}%`}
            />
            <OverviewCard
              accentClass="border-l-violet-500"
              detail="Published during the current month"
              icon={<BellRing className="text-violet-700" size={20} />}
              iconClass="bg-violet-50"
              title="Announcements This Month"
              value={overviewStats.announcements_this_month.toLocaleString()}
            />
            <OverviewCard
              accentClass="border-l-rose-500"
              detail="Delivered during the current month"
              icon={<Mail className="text-rose-700" size={20} />}
              iconClass="bg-rose-50"
              title="Emails Sent This Month"
              value={overviewStats.emails_sent_this_month.toLocaleString()}
            />
          </>
        ) : null}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <Suspense fallback={<SectionFallback />}>
          <AdmissionChart data={admissions.data} error={admissions.error} isLoading={admissions.isLoading} onRefresh={admissions.refresh} />
        </Suspense>
        <Suspense fallback={<SectionFallback height="min-h-[280px]" />}>
          <QuickActionsPanel emailStats={email.data} error={email.error} isLoading={email.isLoading} onRefresh={email.refresh} />
        </Suspense>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Suspense fallback={<SectionFallback />}>
          <StudentStatsChart data={students.data} error={students.error} isLoading={students.isLoading} onRefresh={students.refresh} />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <MonthlyTrendChart data={trends.data} error={trends.error} isLoading={trends.isLoading} onRefresh={trends.refresh} />
        </Suspense>
      </div>

      <Suspense fallback={<SectionFallback height="min-h-[380px]" />}>
        <AttendanceChart data={attendance.data} error={attendance.error} isLoading={attendance.isLoading} onRefresh={attendance.refresh} />
      </Suspense>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Suspense fallback={<SectionFallback />}>
          <AcademicPerformanceChart data={academic.data} error={academic.error} isLoading={academic.isLoading} onRefresh={academic.refresh} />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HiflProgressChart data={hifl.data} error={hifl.error} isLoading={hifl.isLoading} onRefresh={hifl.refresh} />
        </Suspense>
      </div>
    </section>
  )
}

export default AdminDashboard
