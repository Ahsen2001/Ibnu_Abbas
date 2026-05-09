import { Bar } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { HiflStatsResponse } from '../../services/analyticsService'
import { analyticsPalette, baseChartOptions } from './chartSetup'

type HiflProgressChartProps = {
  data: HiflStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function HiflProgressChart({ data, isLoading, error, onRefresh }: HiflProgressChartProps) {
  const progressBuckets = data?.progress_buckets ?? []

  const chartData = {
    labels: progressBuckets.map((item) => item.label),
    datasets: [
      {
        label: 'Students',
        data: progressBuckets.map((item) => item.count),
        backgroundColor: [
          analyticsPalette.rose,
          analyticsPalette.amber,
          analyticsPalette.cyan,
          analyticsPalette.emerald,
        ],
        borderRadius: 8,
      },
    ],
  }

  const options = {
    ...baseChartOptions,
    indexAxis: 'y',
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        display: false,
      },
    },
  } as ChartOptions<'bar'>

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Hifl</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Hifl Progress</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Watch completion progress bands and milestone attainment across memorization students.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? (
        <div className="mt-5 grid gap-5">
          <Skeleton className="h-80 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <Skeleton className="h-28 w-full" key={`hifl-milestone-skeleton-${index}`} />)}
          </div>
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 grid gap-5">
          <article className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-college-ink">Progress Distribution</h3>
              <span className="text-sm text-slate-500">{data.average_completion_percentage.toFixed(1)}% avg</span>
            </div>
            <div className="mt-4 h-80">
              <Bar data={chartData} options={options} />
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">25%+</p>
              <strong className="mt-3 block text-3xl font-bold text-college-ink">{data.milestones.quarter}</strong>
            </article>
            <article className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">50%+</p>
              <strong className="mt-3 block text-3xl font-bold text-college-ink">{data.milestones.halfway}</strong>
            </article>
            <article className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">75%+</p>
              <strong className="mt-3 block text-3xl font-bold text-college-ink">{data.milestones.advanced}</strong>
            </article>
            <article className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">100%</p>
              <strong className="mt-3 block text-3xl font-bold text-college-ink">{data.milestones.complete}</strong>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default HiflProgressChart
