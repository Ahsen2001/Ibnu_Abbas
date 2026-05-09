import { Download, Pencil } from 'lucide-react'
import { studentService, type StudentRecord } from '../../services/studentService'
import { formatDateTime } from '../../utils/date'

type StudentProfileProps = {
  student: StudentRecord
  onEdit?: () => void
}

function StudentProfile({ student, onEdit }: StudentProfileProps) {
  const photoUrl = studentService.getFileUrl(student.photo_path)

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          {photoUrl ? (
            <img alt={student.full_name} className="h-28 w-28 rounded-xl object-cover shadow-sm" src={photoUrl} />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
              No Photo
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Student Profile</p>
            <h2 className="mt-2 text-2xl font-bold text-college-ink">{student.full_name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {student.student_id} | {student.department.toUpperCase()} | Batch {student.batch}
            </p>
            <p className="mt-1 text-sm text-slate-500">{student.email || 'No email recorded'}</p>
          </div>
        </div>
        {onEdit ? (
          <button className="btn-secondary" onClick={onEdit} type="button">
            <Pencil size={16} />
            Edit
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Personal Information</h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Date of Birth</dt><dd className="font-medium text-college-ink">{student.date_of_birth || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Gender</dt><dd className="font-medium text-college-ink">{student.gender || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Nationality</dt><dd className="font-medium text-college-ink">{student.nationality || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Religion</dt><dd className="font-medium text-college-ink">{student.religion || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Phone</dt><dd className="font-medium text-college-ink">{student.phone || 'Not recorded'}</dd></div>
            <div className="grid gap-1"><dt className="text-slate-500">Address</dt><dd className="font-medium text-college-ink">{student.address || 'Not recorded'}</dd></div>
          </dl>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Academic Information</h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Department</dt><dd className="font-medium text-college-ink">{student.department.toUpperCase()}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Batch</dt><dd className="font-medium text-college-ink">{student.batch || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Enrollment Date</dt><dd className="font-medium text-college-ink">{formatDateTime(student.enrollment_timestamp ?? student.enrollment_date ?? student.created_at)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="font-medium text-college-ink">{student.status}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Linked Application</dt><dd className="font-medium text-college-ink">{student.application?.application_no || 'Not linked'}</dd></div>
          </dl>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Guardian Information</h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Guardian Name</dt><dd className="font-medium text-college-ink">{student.guardian_name || 'Not recorded'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Guardian Phone</dt><dd className="font-medium text-college-ink">{student.guardian_phone || 'Not recorded'}</dd></div>
          </dl>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h3>
          <div className="mt-3 grid gap-3">
            {student.documents?.length ? (
              student.documents.map((documentPath) => (
                <a
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-college-ink transition hover:border-college-green hover:bg-teal-50"
                  href={studentService.getFileUrl(documentPath)}
                  key={documentPath}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="truncate">{documentPath.split('/').pop()}</span>
                  <Download size={16} />
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-500">No documents uploaded for this student.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

export default StudentProfile
