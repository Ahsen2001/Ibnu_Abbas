import { Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { MonthlyTrendsResponse } from '../../services/analyticsService'
import { analyticsPalette, baseChartOptions } from './chartSetup'

type MonthlyTrendChartProps = {
  data: MonthlyTrendsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function MonthlyTrendChart({ data, isLoading, error, onRefresh }: MonthlyTrendChartProps) {
  const chartData = {
    labels: data?.labels ?? [],
    datasets: [
      {
        label: 'New Students',
        data: data?.enrollments ?? [],
        borderColor: analyticsPalette.teal,
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: analyticsPalette.teal,
      },
      {
        label: 'Applications Received',
        data: data?.applications ?? [],
        borderColor: analyticsPalette.amber,
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: analyticsPalette.amber,
      },
    ],
  }

  const options = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        ticks: {
          ...baseChartOptions.scales.y.ticks,
          precision: 0,
        },
      },
    },
  } as ChartOptions<'line'>

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Trends</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Monthly Growth Trend</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Compare student enrollments with the applications pipeline across the last 12 months or selected year.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? <Skeleton className="mt-5 h-96 w-full" /> : null}

      {data ? (
        <div className="mt-5">
          <div className="h-96 rounded-xl border border-slate-200 p-4">
            <Line data={chartData} options={options} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default MonthlyTrendChart
