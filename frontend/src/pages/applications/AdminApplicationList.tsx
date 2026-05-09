import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import type { AdmissionApplication, ApplicationFilters } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'
import AdminApplicationDetail from './AdminApplicationDetail'

function AdminApplicationList() {
  const [filters, setFilters] = useState<ApplicationFilters>({ per_page: 10 })
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [selected, setSelected] = useState<AdmissionApplication | null>(null)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitialLoading = isLoading && applications.length === 0

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    applicationService
      .listAdmin({ ...filters, page })
      .then((response) => {
        setApplications(response.data)
        setLastPage(response.last_page)
        if (!selected && response.data[0]) {
          setSelected(response.data[0])
        }
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, 'Unable to load applications.')))
      .finally(() => setIsLoading(false))
  }, [filters, page, selected])

  const handleUpdated = (updated: AdmissionApplication) => {
    setSelected(updated)
    setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Admissions Admin</p>
            <h2 className="mt-2 text-2xl font-bold text-college-ink">Application Queue</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value || undefined }))}>
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="offered">Offered</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Department
              <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value || undefined }))}>
                <option value="">All departments</option>
                <option value="shareea">Shareea</option>
                <option value="hifl">Hifl</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              From
              <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value || undefined }))} type="date" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              To
              <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value || undefined }))} type="date" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Search
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="form-input pl-10"
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value || undefined }))}
                placeholder="Search by name or email"
              />
            </div>
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1.4fr_1fr_0.9fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
            <span>Applicant</span>
            <span>Department</span>
            <span>Status</span>
          </div>
          {isLoading && applications.length > 0 ? (
            <div className="border-b border-slate-200 bg-teal-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-college-green">
              Refreshing queue...
            </div>
          ) : null}
          {isInitialLoading ? (
            <div className="grid gap-0 divide-y divide-slate-200 bg-white px-4 py-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="grid grid-cols-[1.4fr_1fr_0.9fr] items-center gap-2 py-4" key={`application-skeleton-${index}`}>
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : null}
          {error ? <p className="px-4 py-6 text-sm text-red-600">{error}</p> : null}
          {!isLoading && !error && applications.length === 0 ? <p className="px-4 py-6 text-sm text-slate-500">No applications found.</p> : null}
          {applications.map((application) => (
            <button
              className={`grid w-full grid-cols-[1.4fr_1fr_0.9fr] items-center gap-2 border-t border-slate-200 px-4 py-4 text-left text-sm transition hover:bg-slate-50 ${selected?.id === application.id ? 'bg-teal-50/70' : 'bg-white'}`}
              key={application.id}
              onClick={() => setSelected(application)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-college-ink">{application.applicant_name}</span>
                <span className="block truncate text-slate-500">{application.email}</span>
              </span>
              <span className="text-slate-600">{application.department.toUpperCase()}</span>
              <span><StatusBadge status={application.status} /></span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {lastPage}</span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
            <button className="btn-secondary" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
          </div>
        </div>
      </section>

      <section>
        {selected ? <AdminApplicationDetail application={selected} onUpdated={handleUpdated} /> : <div className="panel p-6 text-sm text-slate-500">Select an application to review.</div>}
      </section>
    </div>
  )
}

export default AdminApplicationList
