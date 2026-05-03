import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FilterPanel from '../../components/FilterPanel'
import { attendanceService, type AttendanceRecord, type AttendanceSummaryRow } from '../../services/attendanceService'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord } from '../../services/studentService'
import { teacherService, type SubjectRecord } from '../../services/teacherService'

function getSummaryTone(percentage: number) {
  if (percentage > 75) return 'bg-emerald-50 text-emerald-700'
  if (percentage >= 50) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

function AttendanceReport() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [subjects, setSubjects] = useState<SubjectRecord[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummaryRow[]>([])
  const [filters, setFilters] = useState({
    student_id: '',
    subject_id: '',
    date_from: '',
    date_to: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      studentService.list({ per_page: 100 }),
      teacherService.getSubjects('admin'),
    ])
      .then(([studentResponse, subjectResponse]) => {
        setStudents(studentResponse.data)
        setSubjects(subjectResponse)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load report filters.')))
  }, [])

  const loadReport = async () => {
    setIsLoading(true)
    try {
      const response = await attendanceService.report(Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value),
      ))
      setRecords(response.records)
      setSummary(response.summary)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load attendance report.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Attendance Reports</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Attendance Summary</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Filter detailed records and review present percentages calculated on the server.</p>
        </div>
        <button
          className="btn-primary"
          onClick={async () => {
            try {
              await attendanceService.exportPdf(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
            } catch (error) {
              toast.error(getApiErrorMessage(error, 'Unable to export attendance report.'))
            }
          }}
          type="button"
        >
          Export to PDF
        </button>
      </div>

      <FilterPanel
        onClear={() => setFilters({ student_id: '', subject_id: '', date_from: '', date_to: '' })}
        title="Report Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Student
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, student_id: event.target.value }))} value={filters.student_id}>
            <option value="">All students</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_id})</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Subject
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, subject_id: event.target.value }))} value={filters.subject_id}>
            <option value="">All subjects</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Date From
          <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} type="date" value={filters.date_from} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Date To
          <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} type="date" value={filters.date_to} />
        </label>
      </FilterPanel>

      <div className="flex justify-end">
        <button className="btn-primary" disabled={isLoading} onClick={loadReport} type="button">
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Summary Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {!summary.length ? <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No summary data available for the selected filters.</td></tr> : null}
              {summary.map((row) => (
                <tr key={row.student_id}>
                  <td className="px-4 py-4 font-semibold text-college-ink">{row.student_name}</td>
                  <td className="px-4 py-4 text-slate-600">{row.student_code}</td>
                  <td className="px-4 py-4 text-slate-600">{row.present}</td>
                  <td className="px-4 py-4 text-slate-600">{row.total}</td>
                  <td className="px-4 py-4">
                    <span className={`status-chip ${getSummaryTone(row.percentage)}`}>{row.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Detailed Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {!records.length ? <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No attendance records found.</td></tr> : null}
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-4 text-slate-600">{record.date}</td>
                  <td className="px-4 py-4 font-semibold text-college-ink">{record.student?.full_name}</td>
                  <td className="px-4 py-4 text-slate-600">{record.subject?.name}</td>
                  <td className="px-4 py-4 text-slate-600">{record.status}</td>
                  <td className="px-4 py-4 text-slate-600">{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export default AttendanceReport
