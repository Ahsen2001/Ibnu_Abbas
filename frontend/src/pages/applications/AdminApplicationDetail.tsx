import { useState } from 'react'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import type { AdmissionApplication, ApplicationStatus } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'
import InterviewScheduler from './InterviewScheduler'

type AdminApplicationDetailProps = {
  application: AdmissionApplication
  onUpdated: (application: AdmissionApplication) => void
}

const adminStatuses: ApplicationStatus[] = ['under_review', 'interview_scheduled', 'offered', 'accepted', 'rejected', 'withdrawn']

function AdminApplicationDetail({ application, onUpdated }: AdminApplicationDetailProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status)
  const [internalNotes, setInternalNotes] = useState(application.internal_notes ?? '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    setIsUpdating(true)

    try {
      const response = await applicationService.updateStatus(application.id, {
        status: status as Exclude<ApplicationStatus, 'draft' | 'submitted'>,
        internal_notes: internalNotes,
        interview_notes: application.interview_notes ?? '',
      })
      toast.success('Application status updated')
      onUpdated(response.application)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update application status.'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOffer = async () => {
    try {
      await applicationService.downloadOffer(application)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to generate offer letter.'))
    }
  }

  return (
    <div className="grid gap-5">
      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Application Detail</p>
            <h2 className="mt-2 text-2xl font-bold text-college-ink">{application.applicant_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{application.email} | {application.phone}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Personal</p>
            <p className="mt-2 text-sm text-slate-700">DOB: {new Date(application.date_of_birth).toLocaleDateString()}</p>
            <p className="text-sm text-slate-700">Gender: {application.gender}</p>
            <p className="text-sm text-slate-700">Nationality: {application.nationality}</p>
            <p className="text-sm text-slate-700">Religion: {application.religion}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Academic</p>
            <p className="mt-2 text-sm text-slate-700">Previous School: {application.previous_school}</p>
            <p className="text-sm text-slate-700">Previous Grade: {application.previous_grade}</p>
            <p className="text-sm text-slate-700">Department: {application.department.toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Address</p>
          <p className="mt-2 text-sm text-slate-700">{application.address}</p>
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-lg font-semibold text-college-ink">Status Management</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            New status
            <select className="form-input" onChange={(event) => setStatus(event.target.value as ApplicationStatus)} value={status}>
              {adminStatuses.map((option) => (
                <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Internal notes
            <textarea
              className="form-input min-h-28 py-3"
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Admin-only notes"
              value={internalNotes}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={isUpdating} onClick={handleStatusUpdate} type="button">
            {isUpdating ? 'Updating...' : 'Confirm Status Update'}
          </button>
          {(application.status === 'offered' || status === 'offered' || application.status === 'accepted') ? (
            <button className="btn-secondary" onClick={handleOffer} type="button">
              Generate Offer Letter
            </button>
          ) : null}
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-lg font-semibold text-college-ink">Interview Scheduler</h3>
        <div className="mt-4">
          <InterviewScheduler application={application} onSaved={onUpdated} />
        </div>
      </section>
    </div>
  )
}

export default AdminApplicationDetail
