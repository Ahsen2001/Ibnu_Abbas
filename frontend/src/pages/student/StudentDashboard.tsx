import { Bell, CalendarDays, FileText, GraduationCap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardCard from '../../components/DashboardCard'
import { api } from '../../services/api'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord } from '../../services/studentService'

type AnnouncementItem = {
  id: number
  title: string
  body: string
  published_at: string | null
}

function StudentDashboard() {
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentService.getProfile(),
      api.get<{ data: AnnouncementItem[] }>('/announcements', { params: { published_only: true, per_page: 4 } }),
    ])
      .then(([studentData, announcementResponse]) => {
        setStudent(studentData)
        setAnnouncements(announcementResponse.data.data)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load the student dashboard.')))
      .finally(() => setIsLoading(false))
  }, [])

  const progressSummary = useMemo(() => {
    if (!student) {
      return { attendanceRate: '0%', shareeaAverage: '0', hiflCompletion: '0%' }
    }

    const attendanceRecords = student.attendance ?? []
    const presentCount = attendanceRecords.filter((item) => item.status === 'present').length
    const attendanceRate = attendanceRecords.length ? `${Math.round((presentCount / attendanceRecords.length) * 100)}%` : '0%'

    const shareeaRecords = (student.shareea_records ?? []).filter((item) => typeof item.marks === 'number')
    const shareeaAverage = shareeaRecords.length
      ? (shareeaRecords.reduce((sum, item) => sum + Number(item.marks ?? 0), 0) / shareeaRecords.length).toFixed(1)
      : '0'

    const latestHifl = student.hifl_progress?.[0]?.completion_percentage ?? 0

    return {
      attendanceRate,
      shareeaAverage,
      hiflCompletion: `${Math.round(latestHifl)}%`,
    }
  }, [student])

  if (isLoading) {
    return <section className="panel p-6 text-sm text-slate-500">Loading student dashboard...</section>
  }

  if (!student) {
    return <section className="panel p-6 text-sm text-slate-500">Student profile is not available.</section>
  }

  return (
    <div className="grid gap-5">
      <section className="panel overflow-hidden bg-gradient-to-r from-teal-900 to-college-green p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-100">Student Dashboard</p>
        <h2 className="mt-3 text-3xl font-bold">Welcome, {student.full_name}</h2>
        <p className="mt-2 text-sm text-teal-50">
          {student.student_id} | {student.department.toUpperCase()} | Batch {student.batch}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard detail="Attendance record" icon={<CalendarDays size={20} />} title="Attendance" value={progressSummary.attendanceRate} />
        <DashboardCard detail="Average marks" icon={<GraduationCap size={20} />} title="Shareea Average" value={progressSummary.shareeaAverage} />
        <DashboardCard detail="Latest memorization progress" icon={<FileText size={20} />} title="Hifl Completion" value={progressSummary.hiflCompletion} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="grid gap-5">
          <section className="panel p-5">
            <h3 className="text-lg font-semibold text-college-ink">Quick Links</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Link className="rounded-lg border border-slate-200 px-4 py-4 text-sm font-semibold text-college-ink transition hover:border-college-green hover:bg-teal-50" to="/student">
                Attendance
              </Link>
              <Link className="rounded-lg border border-slate-200 px-4 py-4 text-sm font-semibold text-college-ink transition hover:border-college-green hover:bg-teal-50" to="/student/shareea">
                Grades
              </Link>
              <Link className="rounded-lg border border-slate-200 px-4 py-4 text-sm font-semibold text-college-ink transition hover:border-college-green hover:bg-teal-50" to="/student/hifl">
                Schedule
              </Link>
            </div>
          </section>

          <section className="panel p-5">
            <h3 className="text-lg font-semibold text-college-ink">Profile Snapshot</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Department</dt><dd className="font-medium text-college-ink">{student.department.toUpperCase()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Batch</dt><dd className="font-medium text-college-ink">{student.batch}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Enrollment Date</dt><dd className="font-medium text-college-ink">{student.enrollment_date || 'Not recorded'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="font-medium text-college-ink">{student.status}</dd></div>
            </dl>
          </section>
        </div>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Bell className="text-college-green" size={18} />
            <h3 className="text-lg font-semibold text-college-ink">Announcements</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {announcements.length ? (
              announcements.map((announcement) => (
                <article className="rounded-lg border border-slate-200 px-4 py-3" key={announcement.id}>
                  <h4 className="font-semibold text-college-ink">{announcement.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{announcement.body}</p>
                  <p className="mt-2 text-xs text-slate-400">{announcement.published_at || 'Recently posted'}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No announcements available right now.</p>
            )}
          </div>
        </section>
      </section>
    </div>
  )
}

export default StudentDashboard
