import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import FileUpload from '../../components/FileUpload'
import StepIndicator from '../../components/StepIndicator'
import type { AdmissionApplication, ApplicationFormValues } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'

const wizardSchema = z.object({
  applicant_name: z.string().min(3, 'Applicant name is required.'),
  date_of_birth: z.string().min(1, 'Date of birth is required.'),
  gender: z.enum(['male', 'female']),
  nationality: z.string().min(2, 'Nationality is required.'),
  religion: z.string().min(2, 'Religion is required.'),
  email: z.string().email('Valid email is required.'),
  phone: z.string().min(6, 'Phone number is required.'),
  address: z.string().min(10, 'Address is required.'),
  guardian_name: z.string().min(3, 'Guardian name is required.'),
  guardian_phone: z.string().min(6, 'Guardian phone is required.'),
  previous_school: z.string().min(3, 'Previous school is required.'),
  previous_grade: z.string().min(1, 'Previous grade is required.'),
  department: z.enum(['shareea', 'hifl']),
})

type WizardValues = z.infer<typeof wizardSchema>

type ApplicationWizardProps = {
  application?: AdmissionApplication | null
  onSaved: (application: AdmissionApplication) => void
  onSubmitted: (application: AdmissionApplication) => void
}

const steps = ['Personal', 'Contact', 'Academic', 'Documents', 'Review']
const draftStorageKey = 'iaac_application_wizard_draft'

function ApplicationWizard({ application, onSaved, onSubmitted }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<string[]>(application?.documents ?? [])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locked, setLocked] = useState(Boolean(application && application.status !== 'draft'))

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      applicant_name: '',
      date_of_birth: '',
      gender: 'male',
      nationality: '',
      religion: '',
      email: '',
      phone: '',
      address: '',
      guardian_name: '',
      guardian_phone: '',
      previous_school: '',
      previous_grade: '',
      department: 'shareea',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (application) {
      form.reset({
        applicant_name: application.applicant_name,
        date_of_birth: application.date_of_birth,
        gender: application.gender,
        nationality: application.nationality,
        religion: application.religion,
        email: application.email,
        phone: application.phone,
        address: application.address,
        guardian_name: application.guardian_name,
        guardian_phone: application.guardian_phone,
        previous_school: application.previous_school,
        previous_grade: application.previous_grade,
        department: application.department,
      })
      setExistingFiles(application.documents ?? [])
      setLocked(application.status !== 'draft')
      return
    }

    const localDraft = localStorage.getItem(draftStorageKey)
    if (localDraft) {
      form.reset(JSON.parse(localDraft) as WizardValues)
    }
  }, [application, form])

  const stepFields: Array<(keyof WizardValues)[]> = [
    ['applicant_name', 'date_of_birth', 'gender', 'nationality', 'religion'],
    ['email', 'phone', 'address', 'guardian_name', 'guardian_phone'],
    ['previous_school', 'previous_grade', 'department'],
    [],
    [],
  ]

  const values = form.watch()

  const toPayload = (): ApplicationFormValues => ({
    ...values,
    existing_documents: existingFiles,
  })

  const nextStep = async () => {
    const fields = stepFields[currentStep - 1]
    const isValid = fields.length === 0 ? true : await form.trigger(fields)

    if (!isValid) {
      toast.error('Please complete the required fields before continuing.')
      return
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length))
  }

  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 1))

  const handleSaveDraft = async () => {
    const payload = toPayload()

    if (!application) {
      localStorage.setItem(draftStorageKey, JSON.stringify(payload))
      toast.success('Draft saved on this device until your first server save.')
      return
    }

    setIsSavingDraft(true)
    try {
      const saved = await applicationService.saveDraft(application.id, payload, files, setUploadProgress)
      setFiles([])
      setExistingFiles(saved.documents ?? [])
      onSaved(saved)
      toast.success('Draft saved successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save draft.'))
    } finally {
      setIsSavingDraft(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = form.handleSubmit(async () => {
    setIsSubmitting(true)
    const payload = toPayload()

    try {
      const saved = application
        ? await applicationService.update(application.id, payload, files, true, setUploadProgress)
        : await applicationService.create(payload, files, setUploadProgress)

      localStorage.removeItem(draftStorageKey)
      setFiles([])
      setExistingFiles(saved.documents ?? [])
      setLocked(saved.status !== 'draft')
      onSubmitted(saved)
      toast.success('Application submitted successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to submit application.'))
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  })

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Applicant name
            <input className="form-input" disabled={locked} {...form.register('applicant_name')} />
            <span className="text-xs text-red-600">{form.formState.errors.applicant_name?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Date of birth
            <input className="form-input" disabled={locked} type="date" {...form.register('date_of_birth')} />
            <span className="text-xs text-red-600">{form.formState.errors.date_of_birth?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Gender
            <select className="form-input" disabled={locked} {...form.register('gender')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nationality
            <input className="form-input" disabled={locked} {...form.register('nationality')} />
            <span className="text-xs text-red-600">{form.formState.errors.nationality?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Religion
            <input className="form-input" disabled={locked} {...form.register('religion')} />
            <span className="text-xs text-red-600">{form.formState.errors.religion?.message}</span>
          </label>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input className="form-input" disabled={locked} type="email" {...form.register('email')} />
            <span className="text-xs text-red-600">{form.formState.errors.email?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Phone
            <input className="form-input" disabled={locked} {...form.register('phone')} />
            <span className="text-xs text-red-600">{form.formState.errors.phone?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <textarea className="form-input min-h-28 py-3" disabled={locked} {...form.register('address')} />
            <span className="text-xs text-red-600">{form.formState.errors.address?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Guardian name
            <input className="form-input" disabled={locked} {...form.register('guardian_name')} />
            <span className="text-xs text-red-600">{form.formState.errors.guardian_name?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Guardian phone
            <input className="form-input" disabled={locked} {...form.register('guardian_phone')} />
            <span className="text-xs text-red-600">{form.formState.errors.guardian_phone?.message}</span>
          </label>
        </div>
      )
    }

    if (currentStep === 3) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Previous school
            <input className="form-input" disabled={locked} {...form.register('previous_school')} />
            <span className="text-xs text-red-600">{form.formState.errors.previous_school?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Previous grade
            <input className="form-input" disabled={locked} {...form.register('previous_grade')} />
            <span className="text-xs text-red-600">{form.formState.errors.previous_grade?.message}</span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Department choice
            <select className="form-input" disabled={locked} {...form.register('department')}>
              <option value="shareea">Shareea</option>
              <option value="hifl">Hifl</option>
            </select>
          </label>
        </div>
      )
    }

    if (currentStep === 4) {
      return (
        <FileUpload
          existingFiles={existingFiles}
          files={files}
          onChange={setFiles}
          onRemoveExisting={locked ? undefined : (path) => setExistingFiles((current) => current.filter((item) => item !== path))}
          progress={uploadProgress}
        />
      )
    }

    return (
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="grid gap-1 md:grid-cols-2">
          <p><strong>Name:</strong> {values.applicant_name}</p>
          <p><strong>DOB:</strong> {values.date_of_birth}</p>
          <p><strong>Gender:</strong> {values.gender}</p>
          <p><strong>Nationality:</strong> {values.nationality}</p>
          <p><strong>Religion:</strong> {values.religion}</p>
          <p><strong>Email:</strong> {values.email}</p>
          <p><strong>Phone:</strong> {values.phone}</p>
          <p><strong>Guardian:</strong> {values.guardian_name}</p>
          <p><strong>Guardian Phone:</strong> {values.guardian_phone}</p>
          <p><strong>Previous School:</strong> {values.previous_school}</p>
          <p><strong>Previous Grade:</strong> {values.previous_grade}</p>
          <p><strong>Department:</strong> {values.department.toUpperCase()}</p>
        </div>
        <div>
          <p><strong>Address:</strong> {values.address}</p>
        </div>
        <div>
          <p><strong>Documents:</strong> {[...existingFiles, ...files.map((file) => file.name)].join(', ') || 'No documents attached yet'}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="panel p-6">
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Admission Wizard</p>
          <h2 className="mt-2 text-2xl font-bold text-college-ink">Application Form</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete each step carefully. Drafts stay editable only while the application remains in draft status and before the submission deadline.
          </p>
        </div>
        <StepIndicator currentStep={currentStep} steps={steps} />
      </div>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        {renderStep()}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <button className="btn-secondary" disabled={currentStep === 1} onClick={previousStep} type="button">
              Previous
            </button>
            {currentStep < steps.length ? (
              <button className="btn-primary" onClick={nextStep} type="button">
                Next
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" disabled={locked || isSavingDraft || isSubmitting} onClick={handleSaveDraft} type="button">
              {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
            </button>
            {currentStep === steps.length ? (
              <button className="btn-primary" disabled={locked || isSubmitting} type="submit">
                {isSubmitting ? 'Submitting...' : 'Review & Submit'}
              </button>
            ) : null}
          </div>
        </div>

        {locked ? <p className="text-sm text-amber-700">This application is no longer editable because it has moved beyond draft status.</p> : null}
      </form>
    </section>
  )
}

export default ApplicationWizard
