import toast from 'react-hot-toast'
import { Download } from 'lucide-react'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord } from '../../services/studentService'

type IdCardPreviewProps = {
  student: StudentRecord
}

function IdCardPreview({ student }: IdCardPreviewProps) {
  const photoUrl = studentService.getFileUrl(student.photo_path)

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Student ID Card</p>
          <h2 className="mt-2 text-xl font-bold text-college-ink">Preview</h2>
        </div>
        <button
          className="btn-primary"
          onClick={async () => {
            try {
              await studentService.downloadIdCard(student)
            } catch (error) {
              toast.error(getApiErrorMessage(error, 'Unable to download the ID card.'))
            }
          }}
          type="button"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-900 to-college-green p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-teal-100">IBNU ABBAS ARABIC COLLEGE</p>
              <h3 className="mt-2 text-lg font-semibold">Student Identity Card</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-xs">LOGO</div>
          </div>
          <div className="mt-5 flex gap-4">
            {photoUrl ? (
              <img alt={student.full_name} className="h-24 w-20 rounded-xl border border-white/20 object-cover" src={photoUrl} />
            ) : (
              <div className="flex h-24 w-20 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xs">PHOTO</div>
            )}
            <div className="min-w-0">
              <p className="text-lg font-bold">{student.full_name}</p>
              <p className="mt-2 text-sm text-teal-50">ID: {student.student_id}</p>
              <p className="mt-1 text-sm text-teal-50">Department: {student.department.toUpperCase()}</p>
              <p className="mt-1 text-sm text-teal-50">Batch: {student.batch}</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-center text-sm tracking-[0.35em] text-white">
            ||| {student.student_id} |||
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-college-ink">Back Layout</h3>
          <p className="mt-2 text-sm text-slate-600">This card remains property of the college and should be produced on request.</p>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p><strong>Guardian Contact:</strong> {student.guardian_phone || 'Not recorded'}</p>
            <p><strong>Enrollment Date:</strong> {student.enrollment_date || 'Not recorded'}</p>
            <p><strong>Status:</strong> {student.status}</p>
          </div>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Carry this card while on campus.</li>
            <li>Report loss immediately to the administration office.</li>
            <li>Misuse of this card may lead to disciplinary action.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default IdCardPreview
