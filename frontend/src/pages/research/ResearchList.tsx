import { CheckCircle2, Download, Eye, FilePlus2, Trash2, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import PdfPreviewModal from '../../components/PdfPreviewModal'
import SearchBar from '../../components/SearchBar'
import TableSkeleton from '../../components/TableSkeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { researchService, type ResearchRecord } from '../../services/researchService'
import ResearchUpload from './ResearchUpload'

const initialFilters = {
  search: '',
  year: '',
  department: '',
  status: '',
  page: 1,
}

function statusClasses(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

function ResearchList() {
  const { role } = useAuth()
  const [filters, setFilters] = useState(initialFilters)
  const [researchPapers, setResearchPapers] = useState<ResearchRecord[]>([])
  const [selectedResearch, setSelectedResearch] = useState<ResearchRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<ResearchRecord | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [previewDocument, setPreviewDocument] = useState<{ title: string; previewUrl: string | null; downloadUrl: string | null } | null>(null)

  const isAdmin = role === 'super_admin' || role === 'admin_staff'
  const canUpload = isAdmin || role === 'student'
  const isInitialLoading = isLoading && researchPapers.length === 0

  const loadResearch = async () => {
    setIsLoading(true)

    try {
      const response = await researchService.list({
        ...filters,
        per_page: 10,
      })

      setResearchPapers(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })

      if (selectedResearch) {
        const refreshed = response.data.find((item) => item.id === selectedResearch.id)
        if (refreshed) {
          setSelectedResearch(refreshed)
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load research papers.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    researchPapers.forEach((paper) => years.add(paper.year))
    return Array.from(years).sort((a, b) => b - a)
  }, [researchPapers])

  const handlePreview = async (paper: ResearchRecord) => {
    try {
      const prepared = await researchService.prepareDownload(paper.id)
      setPreviewDocument({
        title: paper.title,
        previewUrl: prepared.preview_url,
        downloadUrl: prepared.download_url,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to prepare the research download.'))
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Research & Publications</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Research Library</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review, approve, and distribute research papers with clean access control across admin, teachers, and students.
          </p>
        </div>
        {canUpload ? (
          <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)} type="button">
            <FilePlus2 size={18} />
            Upload Research
          </button>
        ) : null}
      </div>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by title, author, or supervisor"
      />

      <FilterPanel
        onClear={() => setFilters(initialFilters)}
        title="Research Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Year
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value, page: 1 }))} value={filters.year}>
            <option value="">All years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Department
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value, page: 1 }))} value={filters.department}>
            <option value="">All departments</option>
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </FilterPanel>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Research Papers</h2>
          <p className="text-sm text-slate-500">Approved papers are ready for secure preview and download. Students also keep visibility into their own submissions.</p>
          {isLoading && researchPapers.length > 0 ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-college-green">Refreshing research records...</p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isInitialLoading ? <TableSkeleton columns={6} rows={6} /> : null}
              {!isLoading && researchPapers.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>No research papers matched the current filters.</td>
                </tr>
              ) : null}
              {researchPapers.map((paper) => (
                <tr className="hover:bg-slate-50" key={paper.id}>
                  <td className="px-4 py-4 align-top">
                    <button className="text-left" onClick={() => setSelectedResearch(paper)} type="button">
                      <p className="font-semibold text-college-ink">{paper.title}</p>
                      <p className="mt-1 text-xs text-slate-500">Supervisor: {paper.supervisor_name}</p>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">{paper.author_name}</td>
                  <td className="px-4 py-4 align-top uppercase">{paper.department}</td>
                  <td className="px-4 py-4 align-top">{paper.year}</td>
                  <td className="px-4 py-4 align-top">
                    <span className={`status-chip ${statusClasses(paper.status)}`}>{paper.status}</span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary min-h-9 px-3" onClick={() => setSelectedResearch(paper)} type="button">
                        <Eye size={15} />
                        View
                      </button>
                      {paper.can_download ? (
                        <button className="btn-secondary min-h-9 px-3" onClick={() => handlePreview(paper)} type="button">
                          <Download size={15} />
                          Download
                        </button>
                      ) : null}
                      {isAdmin ? (
                        <>
                          <button
                            className="btn-secondary min-h-9 px-3 text-emerald-700 hover:bg-emerald-50"
                            onClick={async () => {
                              try {
                                await researchService.approve(paper.id, paper.review_notes ?? undefined)
                                toast.success('Research approved.')
                                await loadResearch()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to approve the research paper.'))
                              }
                            }}
                            type="button"
                          >
                            <CheckCircle2 size={15} />
                            Approve
                          </button>
                          <button className="btn-secondary min-h-9 px-3 text-amber-700 hover:bg-amber-50" onClick={() => {
                            setRejectTarget(paper)
                            setRejectNotes(paper.review_notes ?? '')
                          }} type="button">
                            <XCircle size={15} />
                            Reject
                          </button>
                          <button
                            className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!window.confirm(`Delete "${paper.title}"?`)) {
                                return
                              }

                              try {
                                await researchService.remove(paper.id)
                                toast.success('Research paper deleted.')
                                if (selectedResearch?.id === paper.id) {
                                  setSelectedResearch(null)
                                }
                                await loadResearch()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to delete the research paper.'))
                              }
                            }}
                            type="button"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
      </section>

      {selectedResearch ? (
        <section className="panel p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Research Detail</p>
              <h2 className="mt-2 text-2xl font-bold text-college-ink">{selectedResearch.title}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {selectedResearch.author_name} | {selectedResearch.year} | {selectedResearch.supervisor_name}
              </p>
            </div>
            <span className={`status-chip ${statusClasses(selectedResearch.status)}`}>{selectedResearch.status}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-college-ink">Research Summary</h3>
              <dl className="mt-3 grid gap-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Department</dt><dd className="font-medium uppercase text-college-ink">{selectedResearch.department}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Student</dt><dd className="font-medium text-college-ink">{selectedResearch.student?.full_name ?? 'Independent submission'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Reviewer</dt><dd className="font-medium text-college-ink">{selectedResearch.reviewer?.name ?? 'Not reviewed yet'}</dd></div>
              </dl>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-college-ink">Description</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{selectedResearch.description || 'No description was added for this paper.'}</p>
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <strong className="text-college-ink">Review Notes:</strong> {selectedResearch.review_notes || 'No review notes yet.'}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8">
          <div className="w-full max-w-4xl rounded-2xl bg-college-mist p-5 shadow-2xl">
            <ResearchUpload
              onCancel={() => setIsUploadModalOpen(false)}
              onSuccess={async (research) => {
                setSelectedResearch(research)
                setIsUploadModalOpen(false)
                await loadResearch()
              }}
            />
          </div>
        </div>
      ) : null}

      {rejectTarget ? (
        <div className="fixed inset-0 z-[66] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Reject Research</p>
            <h3 className="mt-2 text-xl font-bold text-college-ink">{rejectTarget.title}</h3>
            <p className="mt-2 text-sm text-slate-500">Add clear feedback so the author understands what to correct before resubmission.</p>

            <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
              Review Notes
              <textarea className="form-input min-h-32 py-3" onChange={(event) => setRejectNotes(event.target.value)} value={rejectNotes} />
            </label>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button className="btn-secondary" onClick={() => setRejectTarget(null)} type="button">Cancel</button>
              <button
                className="btn-primary"
                onClick={async () => {
                  try {
                    await researchService.reject(rejectTarget.id, rejectNotes)
                    toast.success('Research rejected with notes.')
                    setRejectTarget(null)
                    setRejectNotes('')
                    await loadResearch()
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to reject the research paper.'))
                  }
                }}
                type="button"
              >
                Save Rejection
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PdfPreviewModal
        downloadUrl={previewDocument?.downloadUrl ?? null}
        onClose={() => setPreviewDocument(null)}
        open={Boolean(previewDocument)}
        previewUrl={previewDocument?.previewUrl ?? null}
        title={previewDocument?.title ?? 'Research Paper'}
      />
    </section>
  )
}

export default ResearchList
