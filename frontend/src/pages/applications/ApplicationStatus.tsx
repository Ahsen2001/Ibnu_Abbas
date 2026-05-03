import { CalendarDays, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AdmissionApplication } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'
import TimelineTracker from '../../components/TimelineTracker'

type ApplicationStatusProps = {
  application: AdmissionApplication
}

function ApplicationStatus({ application }: ApplicationStatusProps) {
  const handleOfferDownload = async () => {
    try {
      await applicationService.downloadOffer(application)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to download offer letter.'))
    }
  }

  const handlePrint = async () => {
    try {
      await applicationService.printApplication(application)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to print application.'))
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="panel p-6">
        <TimelineTracker status={application.status} />
      </div>
      <div className="panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Application Status</p>
            <h2 className="mt-2 text-2xl font-bold text-college-ink">{application.applicant_name}</h2>
            <p className="mt-1 text-sm text-slate-500">Reference {application.application_no}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Department</p>
            <p className="mt-2 text-sm font-semibold text-college-ink">{application.department.toUpperCase()}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Submitted At</p>
            <p className="mt-2 text-sm font-semibold text-college-ink">{application.submitted_at ? new Date(application.submitted_at).toLocaleString() : 'Draft only'}</p>
          </div>
        </div>

        {application.interview_date ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <CalendarDays size={18} />
              <p className="font-semibold">Interview Scheduled</p>
            </div>
            <p className="mt-2 text-sm text-amber-900">
              {new Date(application.interview_date).toLocaleDateString()} at {application.interview_time}
            </p>
            {application.interview_notes ? <p className="mt-2 text-sm text-amber-900">{application.interview_notes}</p> : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={handlePrint} type="button">
            <FileText size={18} />
            Print Application
          </button>
          {application.status === 'offered' || application.status === 'accepted' ? (
            <button className="btn-primary" onClick={handleOfferDownload} type="button">
              <Download size={18} />
              Download Offer Letter
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ApplicationStatus
