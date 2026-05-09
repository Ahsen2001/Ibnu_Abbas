import { FileBadge, FileText, FileUser, GraduationCap, ScrollText, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import PdfPreviewModal from '../../components/PdfPreviewModal'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { applicationService, type AdmissionApplication } from '../../services/applicationService'
import { documentService, type IssuedDocumentRecord } from '../../services/documentService'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord } from '../../services/studentService'

type DocumentCenterProps = {
  embedded?: boolean
}

type PreviewState = {
  title: string
  previewUrl: string | null
  downloadUrl: string | null
}

function ActionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <article className="panel flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-teal-50 p-3 text-college-green">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-college-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  )
}

function DocumentCenter({ embedded = false }: DocumentCenterProps) {
  const { role } = useAuth()
  const isAdmin = role === 'super_admin' || role === 'admin_staff'
  const isStudent = role === 'student'
  const canInterviewList = isAdmin || role === 'teacher'

  const [students, setStudents] = useState<StudentRecord[]>([])
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [studentProfile, setStudentProfile] = useState<StudentRecord | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | ''>('')
  const [certificateType, setCertificateType] = useState<'completion' | 'graduation'>('completion')
  const [semester, setSemester] = useState('')
  const [interviewFilters, setInterviewFilters] = useState({
    department: '',
    date_from: '',
    date_to: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [previewState, setPreviewState] = useState<PreviewState | null>(null)

  useEffect(() => {
    setIsLoading(true)

    if (isAdmin) {
      Promise.all([
        studentService.list({ per_page: 100 }),
        applicationService.listAdmin({ per_page: 100 }),
      ])
        .then(([studentsResponse, applicationsResponse]) => {
          setStudents(studentsResponse.data)
          setApplications(applicationsResponse.data)
        })
        .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load document selector data.')))
        .finally(() => setIsLoading(false))

      return
    }

    if (isStudent) {
      studentService
        .getProfile()
        .then((profile) => {
          setStudentProfile(profile)
          if (profile.application) {
            setSelectedApplicationId(profile.application.id)
          }
        })
        .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load your student profile for document generation.')))
        .finally(() => setIsLoading(false))

      return
    }

    setIsLoading(false)
  }, [isAdmin, isStudent])

  const resolvedStudentId = useMemo(() => {
    if (isAdmin) {
      return selectedStudentId ? Number(selectedStudentId) : null
    }

    return studentProfile?.id ?? null
  }, [isAdmin, selectedStudentId, studentProfile])

  const resolvedApplicationId = useMemo(() => {
    if (isAdmin) {
      return selectedApplicationId ? Number(selectedApplicationId) : null
    }

    return studentProfile?.application?.id ?? (selectedApplicationId ? Number(selectedApplicationId) : null)
  }, [isAdmin, selectedApplicationId, studentProfile])

  const openPreview = (document: IssuedDocumentRecord) => {
    setPreviewState({
      title: document.title,
      previewUrl: document.preview_url,
      downloadUrl: document.download_url,
    })
  }

  const runAction = async (actionKey: string, callback: () => Promise<{ document: IssuedDocumentRecord }>) => {
    setActiveAction(actionKey)

    try {
      const response = await callback()
      toast.success('Document generated successfully.')
      openPreview(response.document)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to generate the requested document.'))
    } finally {
      setActiveAction(null)
    }
  }

  if (isLoading) {
    return (
      <section className="grid gap-5">
        {!embedded ? (
          <div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-3 h-10 w-72" />
            <Skeleton className="mt-3 h-5 w-full max-w-3xl" />
          </div>
        ) : null}
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-64 w-full" key={`document-center-skeleton-${index}`} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-5">
      {!embedded ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Research & Documents</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Document Center</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Generate branded college documents instantly with preview-ready secure links and controlled access.
          </p>
        </div>
      ) : null}

      {isAdmin ? (
        <section className="panel p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-college-ink">Document Targeting</h2>
            <p className="text-xs text-slate-500">Choose the student or application before you generate records that depend on them.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Student
              <select className="form-input" onChange={(event) => setSelectedStudentId(event.target.value ? Number(event.target.value) : '')} value={selectedStudentId}>
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.student_id})
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Application
              <select className="form-input" onChange={(event) => setSelectedApplicationId(event.target.value ? Number(event.target.value) : '')} value={selectedApplicationId}>
                <option value="">Select an application</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.applicant_name} ({application.application_no})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : (
        <section className="panel p-4">
          <p className="text-sm text-slate-600">
            Documents in this center are prepared for your own profile and application records.
          </p>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <ActionCard description="Create a full student biodata sheet with personal, guardian, and admission details." icon={<FileUser size={22} />} title="Biodata">
          <button
            className="btn-primary w-full"
            disabled={!resolvedStudentId || activeAction === 'biodata'}
            onClick={() => runAction('biodata', () => documentService.generateBiodata(resolvedStudentId as number))}
            type="button"
          >
            {activeAction === 'biodata' ? 'Generating...' : 'Generate Biodata'}
          </button>
        </ActionCard>

        <ActionCard description="Render the submitted application form with all stored admission details and uploaded references." icon={<FileText size={22} />} title="Application Form">
          <button
            className="btn-primary w-full"
            disabled={!resolvedApplicationId || activeAction === 'application'}
            onClick={() => runAction('application', () => documentService.generateApplication(resolvedApplicationId as number))}
            type="button"
          >
            {activeAction === 'application' ? 'Generating...' : 'Generate Application'}
          </button>
        </ActionCard>

        <ActionCard description="Produce the offer letter with college conditions, issue date, and branded letterhead." icon={<ScrollText size={22} />} title="Offer Letter">
          <button
            className="btn-primary w-full"
            disabled={!resolvedApplicationId || activeAction === 'offer'}
            onClick={() => runAction('offer', () => documentService.generateOfferLetter(resolvedApplicationId as number))}
            type="button"
          >
            {activeAction === 'offer' ? 'Generating...' : 'Generate Offer Letter'}
          </button>
        </ActionCard>

        <ActionCard description="Issue completion or graduation certificates with signature lines and the official stamp area." icon={<FileBadge size={22} />} title="Certificate">
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Certificate Type
              <select className="form-input" onChange={(event) => setCertificateType(event.target.value as 'completion' | 'graduation')} value={certificateType}>
                <option value="completion">Completion</option>
                <option value="graduation">Graduation</option>
              </select>
            </label>
            <button
              className="btn-primary w-full"
              disabled={!resolvedStudentId || activeAction === 'certificate'}
              onClick={() => runAction('certificate', () => documentService.generateCertificate(resolvedStudentId as number, certificateType))}
              type="button"
            >
              {activeAction === 'certificate' ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </ActionCard>

        <ActionCard description="Prepare a transcript from Shareea performance records, filtered by academic level when needed." icon={<GraduationCap size={22} />} title="Transcript">
          <div className="grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Semester / Academic Level
              <input className="form-input" onChange={(event) => setSemester(event.target.value)} placeholder="Optional, for example Semester 1" value={semester} />
            </label>
            <button
              className="btn-primary w-full"
              disabled={!resolvedStudentId || activeAction === 'transcript'}
              onClick={() => runAction('transcript', () => documentService.generateTranscript(resolvedStudentId as number, semester || undefined))}
              type="button"
            >
              {activeAction === 'transcript' ? 'Generating...' : 'Generate Transcript'}
            </button>
          </div>
        </ActionCard>

        {canInterviewList ? (
          <ActionCard description="Compile the interview schedule for shortlisted applicants over a chosen date window." icon={<UsersRound size={22} />} title="Interview List">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Department
                  <select className="form-input" onChange={(event) => setInterviewFilters((current) => ({ ...current, department: event.target.value }))} value={interviewFilters.department}>
                    <option value="">All departments</option>
                    <option value="shareea">Shareea</option>
                    <option value="hifl">Hifl</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  From
                  <input className="form-input" onChange={(event) => setInterviewFilters((current) => ({ ...current, date_from: event.target.value }))} type="date" value={interviewFilters.date_from} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  To
                  <input className="form-input" onChange={(event) => setInterviewFilters((current) => ({ ...current, date_to: event.target.value }))} type="date" value={interviewFilters.date_to} />
                </label>
              </div>
              <button
                className="btn-primary w-full"
                disabled={activeAction === 'interview-list'}
                onClick={() => runAction('interview-list', () => documentService.generateInterviewList(interviewFilters))}
                type="button"
              >
                {activeAction === 'interview-list' ? 'Generating...' : 'Generate Interview List'}
              </button>
            </div>
          </ActionCard>
        ) : null}
      </div>

      <PdfPreviewModal
        downloadUrl={previewState?.downloadUrl ?? null}
        onClose={() => setPreviewState(null)}
        open={Boolean(previewState)}
        previewUrl={previewState?.previewUrl ?? null}
        title={previewState?.title ?? 'Document'}
      />
    </section>
  )
}

export default DocumentCenter
