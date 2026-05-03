import { BookOpen, CalendarDays, GraduationCap } from 'lucide-react'
import DashboardCard from '../../components/DashboardCard'

function StudentDashboard() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard detail="Current department" icon={<BookOpen size={20} />} title="Program" value="Shareea" />
        <DashboardCard detail="Latest Hifl record" icon={<GraduationCap size={20} />} title="Progress" value="72%" />
        <DashboardCard detail="This month" icon={<CalendarDays size={20} />} title="Attendance" value="96%" />
      </section>
      <section className="panel p-6">
        <h2 className="text-xl font-bold text-college-ink">Student Overview</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This workspace is wired for student profile, Shareea academic records, Hifl progress, and attendance data.
        </p>
      </section>
    </div>
  )
}

export default StudentDashboard
