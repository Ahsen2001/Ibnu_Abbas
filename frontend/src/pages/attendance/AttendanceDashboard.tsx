import { AlertTriangle, ClipboardCheck, TrendingUp, Users } from 'lucide-react'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardCard from '../../components/DashboardCard'
import { attendanceService, type AttendanceSummaryRow } from '../../services/attendanceService'
import { getApiErrorMessage } from '../../services/errorService'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function AttendanceDashboard() {
  const [todayRecords, setTodayRecords] = useState<Array<{ subject?: { name: string } | null; status: string }>>([])
  const [summary, setSummary] = useState<AttendanceSummaryRow[]>([])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    Promise.all([
      attendanceService.report({ date_from: today, date_to: today }),
      attendanceService.report({
        date_from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        date_to: today,
      }),
    ])
      .then(([todayResponse, rangeResponse]) => {
        setTodayRecords(todayResponse.records)
        setSummary(rangeResponse.summary)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load attendance dashboard.')))
  }, [])

  const subjectChartData = useMemo(() => {
    const grouped = todayRecords.reduce<Record<string, { total: number; present: number }>>((carry, record) => {
      const subjectName = record.subject?.name ?? 'Unassigned Subject'
      carry[subjectName] ??= { total: 0, present: 0 }
      carry[subjectName].total += 1
      if (record.status === 'present') {
        carry[subjectName].present += 1
      }
      return carry
    }, {})

    return Object.entries(grouped).map(([label, values]) => ({
      label,
      percentage: values.total > 0 ? Math.round((values.present / values.total) * 100) : 0,
    }))
  }, [todayRecords])

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: subjectChartData.map((item) => item.label),
        datasets: [
          {
            label: 'Present %',
            data: subjectChartData.map((item) => item.percentage),
            backgroundColor: '#0f766e',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    })

    return () => chart.destroy()
  }, [subjectChartData])

  const lowAttendance = summary.filter((row) => row.percentage < 75)
  const presentToday = todayRecords.filter((record) => record.status === 'present').length
  const todayPercentage = todayRecords.length ? Math.round((presentToday / todayRecords.length) * 100) : 0

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase text-college-green">Attendance Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Attendance Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Review today’s attendance picture, subject-level presence, and students trending below target attendance.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <DashboardCard detail="Records marked today" icon={<ClipboardCheck size={20} />} title="Today's Records" value={String(todayRecords.length)} />
        <DashboardCard detail="Present students today" icon={<Users size={20} />} title="Present Today" value={String(presentToday)} />
        <DashboardCard detail="Overall present rate today" icon={<TrendingUp size={20} />} title="Today's %" value={`${todayPercentage}%`} />
        <DashboardCard detail="Students under 75%" icon={<AlertTriangle size={20} />} title="Low Alerts" value={String(lowAttendance.length)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-college-ink">Attendance % Per Subject</h2>
          <div className="mt-5 h-80">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-college-ink">Low Attendance Alerts</h2>
          <div className="mt-4 grid gap-3">
            {lowAttendance.length ? lowAttendance.map((row) => (
              <article className="rounded-lg border border-slate-200 px-4 py-3" key={row.student_id}>
                <h3 className="font-semibold text-college-ink">{row.student_name}</h3>
                <p className="mt-1 text-sm text-slate-500">{row.student_code}</p>
                <span className="mt-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{row.percentage}% present</span>
              </article>
            )) : <p className="text-sm text-slate-500">No low-attendance alerts right now.</p>}
          </div>
        </section>
      </section>
    </section>
  )
}

export default AttendanceDashboard
