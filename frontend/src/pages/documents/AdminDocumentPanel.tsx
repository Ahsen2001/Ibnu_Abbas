import { FileArchive, FileUp, Files, Filter, ListChecks, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DocumentCenter from './DocumentCenter'
import Pagination from '../../components/Pagination'
import PdfPreviewModal from '../../components/PdfPreviewModal'
import TableSkeleton from '../../components/TableSkeleton'
import { documentService, type IssuedDocumentRecord } from '../../services/documentService'
import { getApiErrorMessage } from '../../services/errorService'
import { studentService, type StudentRecord } from '../../services/studentService'

type PreviewState = {
  title: string
  previewUrl: string | null
  downloadUrl: string | null
}

function AdminDocumentPanel() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [certificateType, setCertificateType] = useState<'completion' | 'graduation'>('completion')
  const [interviewFilters, setInterviewFilters] = useState({
    department: '',
    date_from: '',
    date_to: '',
  })
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedDocumentRecord[]>([])
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [selectedUploadStudentId, setSelectedUploadStudentId] = useState<number | ''>('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [isInterviewGenerating, setIsInterviewGenerating] = useState(false)
  const [previewState, setPreviewState] = useState<PreviewState | null>(null)

  const loadData = async (page = 1) => {
    setIsLoading(true)

    try {
      const [studentsResponse, issuedResponse] = await Promise.all([
        studentService.list({ per_page: 100 }),
        documentService.listIssued({ document_type: 'certificate', per_page: 10, page }),
      ])

      setStudents(studentsResponse.data)
      setIssuedCertificates(issuedResponse.data)
      setPagination({
        currentPage: issuedResponse.current_page,
        lastPage: issuedResponse.last_page,
        total: issuedResponse.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load the document administration panel.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const allSelected = useMemo(
    () => students.length > 0 && students.every((student) => selectedStudentIds.includes(student.id)),
    [selectedStudentIds, students],
  )

  const openPreview = (document: IssuedDocumentRecord) => {
    setPreviewState({
      title: document.title,
      previewUrl: document.preview_url,
      downloadUrl: document.download_url,
    })
  }

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Research & Documents</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Admin Document Panel</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Generate official records in bulk, compile interview schedules, upload certified files, and keep a visible history of issued certificates.
        </p>
      </div>

      <DocumentCenter embedded />

      <section className="panel p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-college-green"><Files size={22} /></div>
          <div>
            <h2 className="text-xl font-semibold text-college-ink">Bulk Certificate Generation</h2>
            <p className="mt-1 text-sm text-slate-500">Select several students and issue completion or graduation certificates in one run.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select className="form-input max-w-52" onChange={(event) => setCertificateType(event.target.value as 'completion' | 'graduation')} value={certificateType}>
            <option value="completion">Completion</option>
            <option value="graduation">Graduation</option>
          </select>
          <button
            className="btn-primary"
            disabled={selectedStudentIds.length === 0 || isBulkGenerating}
            onClick={async () => {
              setIsBulkGenerating(true)

              try {
                const generated: IssuedDocumentRecord[] = []

                for (const studentId of selectedStudentIds) {
                  const response = await documentService.generateCertificate(studentId, certificateType)
                  generated.push(response.document)
                }

                toast.success(`${generated.length} certificate${generated.length === 1 ? '' : 's'} generated successfully.`)
                setSelectedStudentIds([])
                if (generated.length > 0) {
                  openPreview(generated[generated.length - 1])
                }
                await loadData(pagination.currentPage)
              } catch (error) {
                toast.error(getApiErrorMessage(error, 'Unable to generate the selected certificates.'))
              } finally {
                setIsBulkGenerating(false)
              }
            }}
            type="button"
          >
            {isBulkGenerating ? 'Generating...' : 'Generate Selected Certificates'}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    checked={allSelected}
                    onChange={() => setSelectedStudentIds(allSelected ? [] : students.map((student) => student.id))}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? <TableSkeleton columns={5} rows={6} /> : null}
              {!isLoading && students.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={5}>No students are available for bulk generation.</td>
                </tr>
              ) : null}
              {students.map((student) => (
                <tr className="hover:bg-slate-50" key={student.id}>
                  <td className="px-4 py-4">
                    <input
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => setSelectedStudentIds((current) => current.includes(student.id) ? current.filter((id) => id !== student.id) : [...current, student.id])}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-college-ink">{student.full_name}</p>
                    <p className="text-xs text-slate-500">{student.student_id}</p>
                  </td>
                  <td className="px-4 py-4 uppercase">{student.department}</td>
                  <td className="px-4 py-4">{student.batch || '-'}</td>
                  <td className="px-4 py-4">
                    <span className="status-chip bg-slate-100 text-slate-700">{student.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
        <section className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-college-green"><ListChecks size={22} /></div>
            <div>
              <h2 className="text-xl font-semibold text-college-ink">Interview List Generator</h2>
              <p className="mt-1 text-sm text-slate-500">Prepare the next interview schedule quickly with a department filter and date range.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
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

          <div className="mt-4">
            <button
              className="btn-primary"
              disabled={isInterviewGenerating}
              onClick={async () => {
                setIsInterviewGenerating(true)

                try {
                  const response = await documentService.generateInterviewList(interviewFilters)
                  toast.success('Interview list generated successfully.')
                  openPreview(response.document)
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to generate the interview list.'))
                } finally {
                  setIsInterviewGenerating(false)
                }
              }}
              type="button"
            >
              {isInterviewGenerating ? 'Generating...' : 'Generate Interview List'}
            </button>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-college-green"><UploadCloud size={22} /></div>
            <div>
              <h2 className="text-xl font-semibold text-college-ink">Official Upload</h2>
              <p className="mt-1 text-sm text-slate-500">Attach a formal PDF to a student record and keep it inside the secured document store.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Student
              <select className="form-input" onChange={(event) => setSelectedUploadStudentId(event.target.value ? Number(event.target.value) : '')} value={selectedUploadStudentId}>
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} ({student.student_id})
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Title
              <input className="form-input" onChange={(event) => setUploadTitle(event.target.value)} value={uploadTitle} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea className="form-input min-h-24 py-3" onChange={(event) => setUploadNotes(event.target.value)} value={uploadNotes} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              PDF File
              <input accept="application/pdf" className="form-input" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} type="file" />
            </label>
            {isUploading ? (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-college-green transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">Uploading... {uploadProgress}%</p>
              </div>
            ) : null}
            <button
              className="btn-primary"
              disabled={!selectedUploadStudentId || !uploadTitle || !uploadFile || isUploading}
              onClick={async () => {
                if (!selectedUploadStudentId || !uploadFile) {
                  toast.error('Choose a student and a PDF file first.')
                  return
                }

                setIsUploading(true)
                setUploadProgress(0)

                try {
                  await documentService.uploadOfficialDocument({
                    student_id: Number(selectedUploadStudentId),
                    title: uploadTitle,
                    file: uploadFile,
                    notes: uploadNotes,
                  }, setUploadProgress)
                  toast.success('Official document uploaded successfully.')
                  setSelectedUploadStudentId('')
                  setUploadTitle('')
                  setUploadNotes('')
                  setUploadFile(null)
                  setUploadProgress(0)
                  await loadData(pagination.currentPage)
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to upload the official document.'))
                } finally {
                  setIsUploading(false)
                }
              }}
              type="button"
            >
              <FileUp size={16} />
              Upload Document
            </button>
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-college-green"><FileArchive size={22} /></div>
            <div>
              <h2 className="text-xl font-semibold text-college-ink">Issued Certificates</h2>
              <p className="mt-1 text-sm text-slate-500">Keep a visible trail of certificate files that have already been generated from the system.</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => loadData(pagination.currentPage)} type="button">
            <Filter size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? <TableSkeleton columns={4} rows={6} /> : null}
              {!isLoading && issuedCertificates.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>No certificates have been issued yet.</td>
                </tr>
              ) : null}
              {issuedCertificates.map((document) => (
                <tr className="hover:bg-slate-50" key={document.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-college-ink">{document.title}</p>
                    <p className="text-xs text-slate-500">{document.document_type.replaceAll('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-college-ink">{document.student?.full_name ?? 'General document'}</p>
                    <p className="text-xs text-slate-500">{document.student?.student_id ?? '-'}</p>
                  </td>
                  <td className="px-4 py-4">{document.issued_at ? new Date(document.issued_at).toLocaleString() : 'Not recorded'}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary min-h-9 px-3" onClick={() => openPreview(document)} type="button">
                        Preview
                      </button>
                      <a className="btn-secondary min-h-9 px-3" href={document.download_url} rel="noreferrer" target="_blank">
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={loadData} total={pagination.total} />
      </section>

      <PdfPreviewModal
        downloadUrl={previewState?.downloadUrl ?? null}
        onClose={() => setPreviewState(null)}
        open={Boolean(previewState)}
        previewUrl={previewState?.previewUrl ?? null}
        title={previewState?.title ?? 'Document Preview'}
      />
    </section>
  )
}

export default AdminDocumentPanel
