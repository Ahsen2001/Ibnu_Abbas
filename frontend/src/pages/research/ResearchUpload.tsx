import { FileUp, UploadCloud, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { researchService, type ResearchPayload, type ResearchRecord } from '../../services/researchService'
import { studentService, type StudentRecord } from '../../services/studentService'

type ResearchUploadProps = {
  onCancel?: () => void
  onSuccess?: (research: ResearchRecord) => void
}

const currentYear = new Date().getFullYear()

const initialState: ResearchPayload = {
  title: '',
  author_name: '',
  student_id: null,
  supervisor_name: '',
  department: 'shareea',
  year: currentYear,
  description: '',
}

function ResearchUpload({ onCancel, onSuccess }: ResearchUploadProps) {
  const { role, user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<ResearchPayload>(() => ({
    ...initialState,
    author_name: user?.name ?? '',
  }))
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const isAdmin = role === 'super_admin' || role === 'admin_staff'

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    studentService
      .list({ per_page: 100 })
      .then((response) => setStudents(response.data))
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load student options for research linking.')))
  }, [isAdmin])

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === Number(form.student_id)),
    [form.student_id, students],
  )

  useEffect(() => {
    if (!selectedStudent) {
      return
    }

    setForm((current) => ({
      ...current,
      author_name: selectedStudent.full_name,
      department: selectedStudent.department,
    }))
  }, [selectedStudent])

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please choose a PDF research file before submitting.')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const saved = await researchService.create(form, file, setUploadProgress)
      toast.success('Research paper uploaded successfully.')
      setForm({
        ...initialState,
        author_name: user?.name ?? '',
      })
      setFile(null)
      setUploadProgress(0)
      onSuccess?.(saved)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload the research paper.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Research Submission</p>
        <h2 className="mt-2 text-2xl font-bold text-college-ink">Upload Research Paper</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Submit PDF research work with its metadata so it can move through review and approval cleanly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Research Title
          <input
            className="form-input"
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            value={form.title}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Author Name
          <input
            className="form-input"
            onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))}
            value={form.author_name}
          />
        </label>

        {isAdmin ? (
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Linked Student
            <select
              className="form-input"
              onChange={(event) => setForm((current) => ({ ...current, student_id: event.target.value ? Number(event.target.value) : null }))}
              value={form.student_id ?? ''}
            >
              <option value="">No linked student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.student_id})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Supervisor Name
          <input
            className="form-input"
            onChange={(event) => setForm((current) => ({ ...current, supervisor_name: event.target.value }))}
            value={form.supervisor_name}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Department
          <select
            className="form-input"
            onChange={(event) => setForm((current) => ({ ...current, department: event.target.value as ResearchPayload['department'] }))}
            value={form.department}
          >
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Academic Year
          <input
            className="form-input"
            max={currentYear + 1}
            min={2000}
            onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value || currentYear) }))}
            type="number"
            value={form.year}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Description
        <textarea
          className="form-input min-h-32 py-3"
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          value={form.description ?? ''}
        />
      </label>

      <div
        className={`rounded-2xl border-2 border-dashed p-6 transition ${isDragging ? 'border-college-green bg-teal-50' : 'border-slate-300 bg-white'}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)

          const droppedFile = event.dataTransfer.files?.[0]
          if (!droppedFile) return

          setFile(droppedFile)
        }}
      >
        <input
          accept="application/pdf"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          ref={fileInputRef}
          type="file"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-teal-50 p-4 text-college-green">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="font-semibold text-college-ink">Drop a PDF here or browse from your device</p>
            <p className="mt-1 text-sm text-slate-500">Only PDF files are accepted. Maximum file size: 20 MB.</p>
          </div>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} type="button">
            <FileUp size={16} />
            Choose PDF
          </button>

          {file ? (
            <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-college-ink">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button className="text-slate-400 transition hover:text-slate-700" onClick={() => setFile(null)} type="button">
                  <X size={16} />
                </button>
              </div>
              {isSubmitting ? (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-college-green transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">Uploading... {uploadProgress}%</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <button className="btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
        <button className="btn-primary" disabled={isSubmitting} onClick={handleSubmit} type="button">
          {isSubmitting ? 'Uploading...' : 'Submit Research'}
        </button>
      </div>
    </section>
  )
}

export default ResearchUpload
