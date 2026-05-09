import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import TableSkeleton from '../../components/TableSkeleton'
import { communicationService, type EmailLogRecord } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

function getStatusChip(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-emerald-50 text-emerald-700'
    case 'failed':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}

function EmailLogViewer() {
  const [logs, setLogs] = useState<EmailLogRecord[]>([])
  const [filters, setFilters] = useState({
    recipient: '',
    status: '',
    date_from: '',
    date_to: '',
    page: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const isInitialLoading = isLoading && logs.length === 0

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const response = await communicationService.getEmailLogs({
        ...filters,
        per_page: 12,
      })
      setLogs(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load email logs.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase text-college-green">Communication</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Email Log Viewer</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Review queued email history, filter by delivery state, and retry failed items.</p>
      </div>

      <SearchBar
        initialValue={filters.recipient}
        onSearch={(recipient) => setFilters((current) => ({ ...current, recipient, page: 1 }))}
        placeholder="Search recipient name or email"
      />

      <FilterPanel
        onClear={() => setFilters({ recipient: '', status: '', date_from: '', date_to: '', page: 1 })}
        title="Log Filters"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
            <option value="">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Date From
          <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value, page: 1 }))} type="date" value={filters.date_from} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Date To
          <input className="form-input" onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value, page: 1 }))} type="date" value={filters.date_to} />
        </label>
      </FilterPanel>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent At</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isInitialLoading ? <TableSkeleton columns={5} rows={6} /> : null}
              {!isLoading && logs.length === 0 ? <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No email logs matched the current filters.</td></tr> : null}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-college-ink">{log.recipient_name || 'Recipient'}</p>
                    <p className="text-slate-500">{log.recipient_email}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-college-ink">{log.subject}</p>
                    {log.error_message ? <p className="mt-1 text-xs text-rose-600">{log.error_message}</p> : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className={`status-chip ${getStatusChip(log.status)}`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">{log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent yet'}</td>
                  <td className="px-4 py-4 align-top">
                    {log.status === 'failed' ? (
                      <button
                        className="btn-secondary min-h-9 px-3"
                        onClick={async () => {
                          try {
                            await communicationService.resendEmail(log.id)
                            toast.success('Email retry queued.')
                            await loadLogs()
                          } catch (error) {
                            toast.error(getApiErrorMessage(error, 'Unable to retry this email.'))
                          }
                        }}
                        type="button"
                      >
                        <RotateCcw size={15} />
                        Resend
                      </button>
                    ) : <span className="text-xs text-slate-400">No action</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && logs.length > 0 ? (
          <div className="border-t border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-college-green">
            Refreshing email history...
          </div>
        ) : null}

        <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
      </section>
    </section>
  )
}

export default EmailLogViewer
