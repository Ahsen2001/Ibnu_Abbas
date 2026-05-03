import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import DashboardCard from '../../components/DashboardCard'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

function AdminDashboard() {
  const chartRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Draft', 'Submitted', 'Review', 'Shortlisted', 'Selected'],
        datasets: [
          {
            label: 'Applications',
            data: [14, 28, 31, 13, 10],
            backgroundColor: '#0f766e',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    })

    return () => chart.destroy()
  }, [])

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard detail="+18 this term" icon={<Users size={20} />} title="Students" value="428" />
        <DashboardCard detail="31 under review" icon={<FileText size={20} />} title="Applications" value="96" />
        <DashboardCard detail="6 active levels" icon={<BookOpen size={20} />} title="Shareea Subjects" value="24" />
        <DashboardCard detail="+4% this month" icon={<GraduationCap size={20} />} title="Hifl Completion" value="72%" />
      </section>

      <section className="panel p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-slate-500">Admissions</p>
          <h2 className="text-lg font-bold text-college-ink">Application Pipeline</h2>
        </div>
        <div className="h-72">
          <canvas ref={chartRef} aria-label="Application pipeline chart" role="img" />
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
