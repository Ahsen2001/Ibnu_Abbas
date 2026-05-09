import { Bar, Pie } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { StudentStatsResponse } from '../../services/analyticsService'
import { analyticsPalette, baseChartOptions } from './chartSetup'

type StudentStatsChartProps = {
  data: StudentStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function StudentStatsChart({ data, isLoading, error, onRefresh }: StudentStatsChartProps) {
  const byDepartment = data?.by_department ?? []
  const byGender = data?.by_gender ?? []
  const byBatch = data?.by_batch ?? []

  const departmentChart = {
    labels: byDepartment.map((item) => item.department.toUpperCase()),
    datasets: [
      {
        label: 'Students',
        data: byDepartment.map((item) => item.count),
        backgroundColor: [analyticsPalette.teal, analyticsPalette.indigo],
        borderRadius: 8,
      },
    ],
  }

  const genderChart = {
    labels: byGender.map((item) => item.gender.toUpperCase()),
    datasets: [
      {
        data: byGender.map((item) => item.count),
        backgroundColor: [analyticsPalette.blue, analyticsPalette.rose],
        borderWidth: 0,
      },
    ],
  }

  const batchChart = {
    labels: byBatch.map((item) => item.batch),
    datasets: [
      {
        label: 'Students',
        data: byBatch.map((item) => item.count),
        backgroundColor: analyticsPalette.amber,
        borderRadius: 8,
      },
    ],
  }

  const barOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        display: false,
      },
    },
  } as ChartOptions<'bar'>

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          boxWidth: 12,
          boxHeight: 12,
          padding: 16,
        },
      },
    },
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Students</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Student Demographics</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Compare department, gender, and batch distribution across the student body.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full xl:col-span-2" />
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-college-ink">Students Per Department</h3>
              <span className="text-sm text-slate-500">{data.totals.students} total</span>
            </div>
            <div className="mt-4 h-72">
              <Bar data={departmentChart} options={barOptions} />
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-college-ink">Gender Distribution</h3>
            <div className="mt-4 h-72">
              <Pie data={genderChart} options={pieOptions} />
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 p-4 xl:col-span-2">
            <h3 className="font-semibold text-college-ink">Students Per Batch</h3>
            <div className="mt-4 h-80">
              <Bar data={batchChart} options={barOptions} />
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}

export default StudentStatsChart
