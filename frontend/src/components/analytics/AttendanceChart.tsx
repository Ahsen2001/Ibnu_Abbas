import { Bar, Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { AttendanceStatsResponse } from '../../services/analyticsService'
import { analyticsPalette, baseChartOptions } from './chartSetup'

type AttendanceChartProps = {
  data: AttendanceStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function AttendanceChart({ data, isLoading, error, onRefresh }: AttendanceChartProps) {
  const monthlyTrend = data?.monthly_trend ?? []
  const bySubject = data?.by_subject ?? []
  const lowAttendance = data?.low_attendance ?? []

  const lineChart = {
    labels: monthlyTrend.map((item) => item.month),
    datasets: [
      {
        label: 'Attendance %',
        data: monthlyTrend.map((item) => item.percentage),
        borderColor: analyticsPalette.teal,
        backgroundColor: 'rgba(15, 118, 110, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: analyticsPalette.teal,
      },
    ],
  }

  const subjectChart = {
    labels: bySubject.map((item) => item.subject),
    datasets: [
      {
        label: 'Attendance %',
        data: bySubject.map((item) => item.percentage),
        backgroundColor: bySubject.map((item) => (item.percentage < 75 ? analyticsPalette.rose : analyticsPalette.cyan)),
        borderRadius: 8,
      },
    ],
  }

  const lineOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        max: 100,
      },
    },
  } as ChartOptions<'line'>

  const barOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        max: 100,
      },
    },
  } as ChartOptions<'bar'>

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Attendance</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Attendance Performance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Watch month-to-month attendance health, subject averages, and low-attendance alerts.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="grid gap-5">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-[33.5rem] w-full" />
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="grid gap-5">
            <article className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-college-ink">Monthly Attendance Trend</h3>
                <span className="text-sm text-slate-500">{data.summary.overall_percentage.toFixed(1)}% overall</span>
              </div>
              <div className="mt-4 h-72">
                <Line data={lineChart} options={lineOptions} />
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-college-ink">Attendance By Subject</h3>
              <div className="mt-4 h-80">
                <Bar data={subjectChart} options={barOptions} />
              </div>
            </article>
          </div>

          <article className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <TriangleAlert className="text-amber-600" size={18} />
              <h3 className="font-semibold text-college-ink">Low Attendance Alerts</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {lowAttendance.length ? lowAttendance.map((student) => (
                <div className="rounded-lg border border-slate-200 px-4 py-3" key={`${student.student_id}-${student.student_code}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-college-ink">{student.student_name}</p>
                      <p className="text-sm text-slate-500">{student.student_code} | {student.department.toUpperCase()}</p>
                    </div>
                    <span className={`status-chip ${student.percentage < 50 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                      {student.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{student.total_records} records in selected period</p>
                </div>
              )) : <p className="text-sm text-slate-500">No students are below the 75% attendance threshold for this filter set.</p>}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}

export default AttendanceChart
