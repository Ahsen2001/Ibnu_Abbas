import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import FileUpload from '../../components/FileUpload'
import PhotoUpload from '../../components/PhotoUpload'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentFormValues, type StudentRecord } from '../../services/studentService'
import { toDateTimeLocalValue } from '../../utils/date'

const studentSchema = z.object({
  application_id: z.string().optional(),
  full_name: z.string().min(3, 'Full name is required.'),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', '']).optional(),
  nationality: z.string().min(2, 'Nationality is required.'),
  religion: z.string().min(2, 'Religion is required.'),
  email: z.string().email('Valid email is required.'),
  phone: z.string().min(7, 'Phone number is required.'),
  address: z.string().min(8, 'Address is required.'),
  guardian_name: z.string().min(3, 'Guardian name is required.'),
  guardian_phone: z.string().min(7, 'Guardian phone is required.'),
  department: z.enum(['shareea', 'hifl']),
  batch: z.string().min(4, 'Batch is required.'),
  enrollment_date: z.string().min(1, 'Enrollment date is required.'),
  status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']),
})

type StudentFormData = z.infer<typeof studentSchema>

type StudentFormProps = {
  student?: StudentRecord | null
  onSuccess: (student: StudentRecord) => void
  onCancel: () => void
}

function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [documents, setDocuments] = useState<File[]>([])
  const [existingDocuments, setExistingDocuments] = useState<string[]>(student?.documents ?? [])
  const [removePhoto, setRemovePhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = useMemo<StudentFormData>(
    () => ({
      application_id: student?.application_id ? String(student.application_id) : '',
      full_name: student?.full_name ?? '',
      date_of_birth: student?.date_of_birth ?? '',
      gender: student?.gender ?? '',
      nationality: student?.nationality ?? '',
      religion: student?.religion ?? '',
      email: student?.email ?? '',
      phone: student?.phone ?? '',
      address: student?.address ?? '',
      guardian_name: student?.guardian_name ?? '',
      guardian_phone: student?.guardian_phone ?? '',
      department: student?.department ?? 'shareea',
      batch: student?.batch ?? String(new Date().getFullYear()),
      enrollment_date: toDateTimeLocalValue(student?.enrollment_date),
      status: student?.status ?? 'active',
    }),
    [student],
  )

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
    setExistingDocuments(student?.documents ?? [])
    setPhoto(null)
    setDocuments([])
    setRemovePhoto(false)
  }, [defaultValues, form, student])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    const payload: StudentFormValues = {
      ...values,
      application_id: values.application_id?.trim() ? values.application_id.trim() : null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || '',
      enrollment_date: values.enrollment_date || null,
    }

    try {
      const savedStudent = student
        ? await studentService.update(student.id, payload, photo, documents, existingDocuments, removePhoto, setUploadProgress)
        : await studentService.create(payload, photo, documents, setUploadProgress)

      toast.success(student ? 'Student updated successfully.' : 'Student created successfully.')
      onSuccess(savedStudent)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save student details.'))
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  })

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="panel p-5">
          <h3 className="text-lg font-semibold text-college-ink">Photo</h3>
          <p className="mt-1 text-sm text-slate-500">This image appears in the student profile and ID card.</p>
          <div className="mt-4">
            <PhotoUpload
              existingPath={removePhoto ? null : student?.photo_path}
              file={photo}
              onChange={(file) => {
                setPhoto(file)
                if (file) {
                  setRemovePhoto(false)
                }
              }}
              onRemoveExisting={() => {
                setPhoto(null)
                setRemovePhoto(true)
              }}
            />
          </div>
        </section>

        <section className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full Name
              <input className="form-input" {...form.register('full_name')} />
              <span className="text-xs text-red-600">{form.formState.errors.full_name?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Application Reference
              <input className="form-input" placeholder="Database ID or application number" {...form.register('application_id')} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Date of Birth
              <input className="form-input" type="date" {...form.register('date_of_birth')} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Gender
              <select className="form-input" {...form.register('gender')}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Nationality
              <input className="form-input" {...form.register('nationality')} />
              <span className="text-xs text-red-600">{form.formState.errors.nationality?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Religion
              <input className="form-input" {...form.register('religion')} />
              <span className="text-xs text-red-600">{form.formState.errors.religion?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input className="form-input" type="email" {...form.register('email')} />
              <span className="text-xs text-red-600">{form.formState.errors.email?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Phone
              <input className="form-input" {...form.register('phone')} />
              <span className="text-xs text-red-600">{form.formState.errors.phone?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <textarea className="form-input min-h-24 py-3" {...form.register('address')} />
              <span className="text-xs text-red-600">{form.formState.errors.address?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Guardian Name
              <input className="form-input" {...form.register('guardian_name')} />
              <span className="text-xs text-red-600">{form.formState.errors.guardian_name?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Guardian Phone
              <input className="form-input" {...form.register('guardian_phone')} />
              <span className="text-xs text-red-600">{form.formState.errors.guardian_phone?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Department
              <select className="form-input" {...form.register('department')}>
                <option value="shareea">Shareea</option>
                <option value="hifl">Hifl</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Batch
              <input className="form-input" {...form.register('batch')} />
              <span className="text-xs text-red-600">{form.formState.errors.batch?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Enrollment Date & Time
              <input className="form-input" type="datetime-local" {...form.register('enrollment_date')} />
              <span className="text-xs text-red-600">{form.formState.errors.enrollment_date?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select className="form-input" {...form.register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <h3 className="text-lg font-semibold text-college-ink">Documents</h3>
        <p className="mt-1 text-sm text-slate-500">Keep supporting records attached to the student profile.</p>
        <div className="mt-4">
          <FileUpload
            existingFiles={existingDocuments}
            files={documents}
            onChange={setDocuments}
            onRemoveExisting={(path) => setExistingDocuments((current) => current.filter((item) => item !== path))}
            progress={uploadProgress}
          />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
        </button>
      </div>
    </form>
  )
}

export default StudentForm
