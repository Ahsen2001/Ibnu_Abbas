import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import PhotoUpload from '../../components/PhotoUpload'
import { getApiErrorMessage } from '../../services/errorService'
import { teacherService, type TeacherFormValues, type TeacherRecord } from '../../services/teacherService'

const teacherSchema = z.object({
  full_name: z.string().min(3, 'Full name is required.'),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', '']).optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  email: z.string().email('Valid email is required.').or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  joining_date: z.string().optional().nullable(),
  department: z.enum(['shareea', 'hifl', 'both']),
  status: z.enum(['active', 'inactive', 'on_leave']),
})

type TeacherFormData = z.infer<typeof teacherSchema>

type TeacherFormProps = {
  teacher?: TeacherRecord | null
  onSuccess: (teacher: TeacherRecord) => void
  onCancel: () => void
}

function TeacherForm({ teacher, onSuccess, onCancel }: TeacherFormProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = useMemo<TeacherFormData>(
    () => ({
      full_name: teacher?.full_name ?? '',
      date_of_birth: teacher?.date_of_birth ?? '',
      gender: teacher?.gender ?? '',
      qualification: teacher?.qualification ?? '',
      specialization: teacher?.specialization ?? '',
      email: teacher?.email ?? '',
      phone: teacher?.phone ?? '',
      address: teacher?.address ?? '',
      joining_date: teacher?.joining_date ?? new Date().toISOString().slice(0, 10),
      department: teacher?.department ?? 'shareea',
      status: teacher?.status ?? 'active',
    }),
    [teacher],
  )

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
    setPhoto(null)
    setRemovePhoto(false)
  }, [defaultValues, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    const payload: TeacherFormValues = {
      ...values,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || '',
      joining_date: values.joining_date || null,
      email: values.email || '',
    }

    try {
      const savedTeacher = teacher
        ? await teacherService.update(teacher.id, payload, photo, removePhoto, setUploadProgress)
        : await teacherService.create(payload, photo, setUploadProgress)

      toast.success(teacher ? 'Teacher updated successfully.' : 'Teacher created successfully.')
      onSuccess(savedTeacher)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save teacher details.'))
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
          <p className="mt-1 text-sm text-slate-500">This image appears in the teacher profile.</p>
          <div className="mt-4">
            <PhotoUpload
              existingPath={removePhoto ? null : teacher?.photo_path}
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
          {uploadProgress > 0 ? <p className="mt-3 text-xs text-slate-500">Upload progress {uploadProgress}%</p> : null}
        </section>

        <section className="panel p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full Name
              <input className="form-input" {...form.register('full_name')} />
              <span className="text-xs text-red-600">{form.formState.errors.full_name?.message}</span>
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
              Qualification
              <input className="form-input" {...form.register('qualification')} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Specialization
              <select className="form-input" {...form.register('specialization')}>
                <option value="">Select specialization</option>
                <option value="Fiqh">Fiqh</option>
                <option value="Hadith">Hadith</option>
                <option value="Tafsir">Tafsir</option>
                <option value="Arabic Grammar">Arabic Grammar</option>
                <option value="Hifz Supervision">Hifz Supervision</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input className="form-input" type="email" {...form.register('email')} />
              <span className="text-xs text-red-600">{form.formState.errors.email?.message}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Phone
              <input className="form-input" {...form.register('phone')} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Joining Date
              <input className="form-input" type="date" {...form.register('joining_date')} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Department
              <select className="form-input" {...form.register('department')}>
                <option value="shareea">Shareea</option>
                <option value="hifl">Hifl</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select className="form-input" {...form.register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <textarea className="form-input min-h-24 py-3" {...form.register('address')} />
            </label>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel} type="button">Cancel</button>
        <button className="btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : teacher ? 'Update Teacher' : 'Create Teacher'}
        </button>
      </div>
    </form>
  )
}

export default TeacherForm
