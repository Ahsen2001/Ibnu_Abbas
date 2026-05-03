import { BookOpen, GraduationCap, Users } from 'lucide-react'
import DashboardCard from '../../components/DashboardCard'

function TeacherDashboard() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard detail="Assigned learners" icon={<Users size={20} />} title="Students" value="38" />
        <DashboardCard detail="Exam records" icon={<BookOpen size={20} />} title="Shareea" value="124" />
        <DashboardCard detail="Daily progress logs" icon={<GraduationCap size={20} />} title="Hifl Logs" value="87" />
      </section>
      <section className="panel p-6">
        <h2 className="text-xl font-bold text-college-ink">Teacher Overview</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Teacher routing is ready for assigned students, Shareea record entry, and Hifl progress tracking.
        </p>
      </section>
    </div>
  )
}

export default TeacherDashboard
