import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { attendanceService, type AttendanceStatus } from '../../services/attendanceService'
import { getApiErrorMessage } from '../../services/errorService'
import { teacherService, type SubjectRecord, type TeacherRecord, type TeacherStudentRecord } from '../../services/teacherService'

const statusOptions: Array<{ value: AttendanceStatus; label: string; activeClass: string }> = [
  { value: 'present', label: 'P', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'absent', label: 'A', activeClass: 'bg-rose-600 text-white border-rose-600' },
  { value: 'late', label: 'L', activeClass: 'bg-amber-500 text-white border-amber-500' },
  { value: 'excused', label: 'E', activeClass: 'bg-slate-600 text-white border-slate-600' },
]

function BulkAttendance() {
  const [teacher, setTeacher] = useState<TeacherRecord | null>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>([])
  const [students, setStudents] = useState<TeacherStudentRecord[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [statuses, setStatuses] = useState<Record<number, { status: AttendanceStatus; remarks: string }>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    teacherService
      .getProfile()
      .then((profile) => {
        setTeacher(profile)
        setSubjects(profile.subjects ?? [])
        setStudents(profile.students ?? [])

        const initialStatuses = Object.fromEntries((profile.students ?? []).map((student) => [student.id, { status: 'present' as AttendanceStatus, remarks: '' }]))
        setStatuses(initialStatuses)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load attendance workspace.')))
  }, [])

  const academicYears = useMemo(
    () => Array.from(new Set(subjects.map((subject) => subject.pivot?.academic_year).filter(Boolean))),
    [subjects],
  )

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase text-college-green">Attendance Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Bulk Attendance</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Select a subject and date, review the student group, and submit one attendance record set for the whole class.</p>
      </div>

      <section className="panel p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Subject
            <select className="form-input" onChange={(event) => setSelectedSubjectId(event.target.value ? Number(event.target.value) : null)} value={selectedSubjectId ?? ''}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={`${subject.id}-${subject.pivot?.academic_year ?? 'na'}`} value={subject.id}>
                  {subject.name} ({subject.code}) {subject.pivot?.academic_year ? `| ${subject.pivot.academic_year}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Date
            <input className="form-input" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
          </label>
          <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600">
            <strong className="block text-college-ink">Assigned Students</strong>
            <span>{students.length} students linked to your current supervision groups.</span>
            {academicYears.length ? <span className="mt-1 block">Academic years: {academicYears.join(', ')}</span> : null}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-500" colSpan={3}>No students have been allocated to this teacher yet.</td></tr>
              ) : null}
              {students.map((student) => {
                const current = statuses[student.id] ?? { status: 'present' as AttendanceStatus, remarks: '' }

                return (
                  <tr key={student.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-college-ink">{student.full_name}</p>
                      <p className="text-slate-500">{student.student_id} | {student.department.toUpperCase()} | {student.batch}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                          <button
                            className={`min-h-10 min-w-10 rounded-lg border text-sm font-semibold transition ${
                              current.status === option.value ? option.activeClass : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                            key={option.value}
                            onClick={() => setStatuses((existing) => ({
                              ...existing,
                              [student.id]: { ...current, status: option.value },
                            }))}
                            type="button"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <input
                        className="form-input"
                        onChange={(event) => setStatuses((existing) => ({
                          ...existing,
                          [student.id]: { ...current, remarks: event.target.value },
                        }))}
                        placeholder="Optional note"
                        value={current.remarks}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={!teacher || !selectedSubjectId || students.length === 0 || isSaving}
          onClick={async () => {
            if (!teacher || !selectedSubjectId) {
              toast.error('Select a subject before saving attendance.')
              return
            }

            setIsSaving(true)
            try {
              await attendanceService.bulk({
                teacher_id: teacher.id,
                subject_id: selectedSubjectId,
                date: selectedDate,
                records: students.map((student) => ({
                  student_id: student.id,
                  status: (statuses[student.id]?.status ?? 'present') as AttendanceStatus,
                  remarks: statuses[student.id]?.remarks ?? '',
                })),
              })

              toast.success('Attendance saved successfully for the whole class.')
            } catch (error) {
              toast.error(getApiErrorMessage(error, 'Unable to save attendance.'))
            } finally {
              setIsSaving(false)
            }
          }}
          type="button"
        >
          {isSaving ? 'Saving Attendance...' : 'Submit Attendance'}
        </button>
      </div>
    </section>
  )
}

export default BulkAttendance
