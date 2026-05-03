import { FileText, Send } from 'lucide-react'

function ApplicantApplicationsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Applicant Portal</p>
            <h1 className="mt-2 text-2xl font-bold text-college-ink">My Applications</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create, edit, submit, and track admission applications before the configured deadline.
            </p>
          </div>
          <button className="btn-primary" type="button">
            <Send size={18} />
            New Application
          </button>
        </div>
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <FileText className="mx-auto text-slate-400" size={34} />
          <p className="mt-3 text-sm font-semibold text-slate-700">No application loaded in this frontend foundation.</p>
          <p className="mt-1 text-sm text-slate-500">The API service and protected applicant routing are ready for integration.</p>
        </div>
      </div>
    </section>
  )
}

export default ApplicantApplicationsPage
