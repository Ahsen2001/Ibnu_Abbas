import { Pencil } from 'lucide-react'
import SubjectAssignment from './SubjectAssignment'
import { teacherService, type TeacherDetailsResponse } from '../../services/teacherService'

type TeacherProfileProps = {
  details: TeacherDetailsResponse
  onEdit: () => void
  onRefresh: () => Promise<void> | void
}

function TeacherProfile({ details, onEdit, onRefresh }: TeacherProfileProps) {
  const { teacher, available_students, available_subjects } = details
  const photoUrl = teacherService.getFileUrl(teacher.photo_path)

  return (
    <div className="grid gap-5">
      <section className="panel p-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {photoUrl ? (
              <img alt={teacher.full_name} className="h-28 w-28 rounded-xl object-cover shadow-sm" src={photoUrl} />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">No Photo</div>
            )}
            <div>
              <p className="text-xs font-bold uppercase text-college-green">Teacher Profile</p>
              <h2 className="mt-2 text-2xl font-bold text-college-ink">{teacher.full_name}</h2>
              <p className="mt-2 text-sm text-slate-500">{teacher.employee_id} | {teacher.department.toUpperCase()} | {teacher.status}</p>
              <p className="mt-1 text-sm text-slate-500">{teacher.email || 'No email recorded'}</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onEdit} type="button">
            <Pencil size={16} />
            Edit
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profile Details</h3>
            <dl className="mt-3 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Date of Birth</dt><dd className="font-medium text-college-ink">{teacher.date_of_birth || 'Not recorded'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Gender</dt><dd className="font-medium text-college-ink">{teacher.gender || 'Not recorded'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Qualification</dt><dd className="font-medium text-college-ink">{teacher.qualification || 'Not recorded'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Specialization</dt><dd className="font-medium text-college-ink">{teacher.specialization || 'Not recorded'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd className="font-medium text-college-ink">{teacher.phone || 'Not recorded'}</dd></div>
              <div className="grid gap-1"><dt className="text-slate-500">Address</dt><dd className="font-medium text-college-ink">{teacher.address || 'Not recorded'}</dd></div>
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attendance Activity</h3>
            <div className="mt-3 grid gap-3">
              {teacher.attendance?.length ? teacher.attendance.slice(0, 8).map((entry) => (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm" key={entry.id}>
                  <strong className="text-college-ink">{entry.subject?.name || 'Subject'}</strong>
                  <span className="ml-2 text-slate-500">{entry.date} | {entry.status}</span>
                </div>
              )) : <p className="text-sm text-slate-500">No attendance history recorded yet.</p>}
            </div>
          </section>
        </div>
      </section>

      <SubjectAssignment
        availableStudents={available_students}
        availableSubjects={available_subjects}
        onUpdated={onRefresh}
        students={teacher.students ?? []}
        subjects={teacher.subjects ?? []}
        teacherId={teacher.id}
      />
    </div>
  )
}

export default TeacherProfile
