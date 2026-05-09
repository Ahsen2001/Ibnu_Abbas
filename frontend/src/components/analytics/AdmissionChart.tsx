import { Doughnut } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { AdmissionStatsResponse } from '../../services/analyticsService'
import { analyticsPalette } from './chartSetup'

type AdmissionChartProps = {
  data: AdmissionStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function AdmissionChart({ data, isLoading, error, onRefresh }: AdmissionChartProps) {
  const statuses = data?.statuses ?? []

  const chartData = {
    labels: statuses.map((item) => item.label),
    datasets: [
      {
        data: statuses.map((item) => item.count),
        backgroundColor: [
          analyticsPalette.slate,
          analyticsPalette.teal,
          analyticsPalette.cyan,
          analyticsPalette.amber,
          analyticsPalette.violet,
          analyticsPalette.emerald,
          analyticsPalette.rose,
          analyticsPalette.indigo,
        ],
        borderWidth: 0,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
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
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 10,
      },
    },
    cutout: '62%',
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Admissions</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Application Pipeline</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Track where applicants sit in the admissions workflow right now.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
          <div className="rounded-xl border border-slate-200 p-5">
            <Skeleton className="mx-auto h-64 w-64 rounded-full" />
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            {Array.from({ length: 7 }, (_, index) => (
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0" key={`admission-skeleton-${index}`}>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="h-80">
              <Doughnut data={chartData} options={options} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Status Breakdown</h3>
              <span className="text-sm font-semibold text-college-ink">{data.total_applications} total</span>
            </div>
            <div className="divide-y divide-slate-200">
              {statuses.map((item) => (
                <div className="flex items-center justify-between gap-4 px-4 py-4" key={item.status}>
                  <div>
                    <p className="font-semibold text-college-ink">{item.label}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{item.status.replaceAll('_', ' ')}</p>
                  </div>
                  <span className="text-lg font-bold text-college-green">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AdmissionChart
