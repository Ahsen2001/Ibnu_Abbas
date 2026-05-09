import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusCircle } from 'lucide-react'
import ApplicationStatus from '../applications/ApplicationStatus'
import ApplicationWizard from '../applications/ApplicationWizard'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import type { AdmissionApplication } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'

function ApplicantApplicationsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([])
  const [selected, setSelected] = useState<AdmissionApplication | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isInitialLoading = isLoading && applications.length === 0

  useEffect(() => {
    applicationService
      .myApplications()
      .then((response) => {
        setApplications(response.data)
        setSelected(response.data[0] ?? null)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load your applications.')))
      .finally(() => setIsLoading(false))
  }, [])

  const upsertApplication = (application: AdmissionApplication) => {
    setApplications((current) => {
      const exists = current.some((item) => item.id === application.id)
      if (!exists) {
        return [application, ...current]
      }

      return current.map((item) => (item.id === application.id ? application : item))
    })
    setSelected(application)
    setWizardOpen(false)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Applicant Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">Admission Applications</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create your application, save drafts while eligible, and monitor admission progress in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setWizardOpen(true)} type="button">
          <PlusCircle size={18} />
          New Application
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="panel p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-college-ink">My Applications</h2>
            {isLoading && applications.length > 0 ? (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-college-green">
                Refreshing latest status...
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3">
            {isInitialLoading ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-3 h-4 w-28" />
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="mt-3 h-4 w-24" />
                </div>
              </>
            ) : null}
            {!isLoading && applications.length === 0 ? <p className="text-sm text-slate-500">No applications yet. Start a new one to begin the admission process.</p> : null}
            {applications.map((application) => (
              <button
                className={`rounded-lg border px-4 py-3 text-left transition ${selected?.id === application.id ? 'border-college-green bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                key={application.id}
                onClick={() => {
                  setSelected(application)
                  setWizardOpen(false)
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-college-ink">{application.applicant_name}</p>
                    <p className="truncate text-sm text-slate-500">{application.application_no}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="grid gap-5">
          {wizardOpen ? (
            <ApplicationWizard
              application={selected?.status === 'draft' ? selected : null}
              onSaved={upsertApplication}
              onSubmitted={upsertApplication}
            />
          ) : null}

          {selected ? <ApplicationStatus application={selected} /> : null}
          {isInitialLoading && !selected ? (
            <section className="panel p-5">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="mt-4 h-24 w-full" />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ApplicantApplicationsPage
