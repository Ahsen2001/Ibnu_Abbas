import { Bar, Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { RefreshCw } from 'lucide-react'
import Skeleton from '../Skeleton'
import type { AcademicStatsResponse } from '../../services/analyticsService'
import { analyticsPalette, baseChartOptions } from './chartSetup'

type AcademicPerformanceChartProps = {
  data: AcademicStatsResponse | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function AcademicPerformanceChart({ data, isLoading, error, onRefresh }: AcademicPerformanceChartProps) {
  const gradeDistribution = data?.grade_distribution ?? []
  const semesterGpa = data?.semester_gpa ?? []
  const topStudents = data?.top_students ?? []

  const gradeChart = {
    labels: gradeDistribution.map((item) => item.grade),
    datasets: [
      {
        label: 'Students',
        data: gradeDistribution.map((item) => item.count),
        backgroundColor: [
          analyticsPalette.emerald,
          analyticsPalette.teal,
          analyticsPalette.blue,
          analyticsPalette.indigo,
          analyticsPalette.amber,
          '#f97316',
          analyticsPalette.rose,
        ],
        borderRadius: 8,
      },
    ],
  }

  const semesterChart = {
    labels: semesterGpa.map((item) => item.semester),
    datasets: [
      {
        label: 'Average GPA',
        data: semesterGpa.map((item) => item.average_gpa),
        borderColor: analyticsPalette.violet,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: analyticsPalette.violet,
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

  const lineOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        max: 4,
      },
    },
  } as ChartOptions<'line'>

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Academics</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Academic Performance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">See grade distribution, GPA movement, and the strongest performers in Shareea records.</p>
        </div>
        <button className="btn-secondary min-h-9 px-3" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={15} />
          Refresh
        </button>
      </div>

      {error && !data ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {isLoading && !data ? (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {data ? (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-college-ink">Grade Distribution</h3>
                <span className="text-sm text-slate-500">{data.summary.total_records} records</span>
              </div>
              <div className="mt-4 h-72">
                <Bar data={gradeChart} options={barOptions} />
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-college-ink">Average GPA Per Semester</h3>
                <span className="text-sm text-slate-500">{data.summary.average_gpa.toFixed(2)} GPA avg</span>
              </div>
              <div className="mt-4 h-72">
                <Line data={semesterChart} options={lineOptions} />
              </div>
            </article>
          </div>

          <article className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-4">
              <h3 className="font-semibold text-college-ink">Top 5 Performing Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Average GPA</th>
                    <th className="px-4 py-3">Average Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {topStudents.map((student) => (
                    <tr key={`${student.student_id}-${student.student_code}`}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-college-ink">{student.full_name}</p>
                        <p className="text-slate-500">{student.student_code}</p>
                      </td>
                      <td className="px-4 py-4 align-top uppercase text-slate-600">{student.department}</td>
                      <td className="px-4 py-4 align-top font-semibold text-college-green">{student.average_gpa.toFixed(2)}</td>
                      <td className="px-4 py-4 align-top text-slate-600">{student.average_marks.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}

export default AcademicPerformanceChart
