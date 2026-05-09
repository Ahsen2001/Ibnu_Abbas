import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FileUploadZone from '../../components/FileUploadZone'
import Pagination from '../../components/Pagination'
import PublishToggle from '../../components/PublishToggle'
import Skeleton from '../../components/Skeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type GuestEntryRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'

const initialForm = {
  guest_name: '',
  designation: '',
  organization: '',
  country: '',
  message: '',
  visit_date: '',
  is_published: false,
  photo: null as File | null,
}

function AdminGuestBookManager() {
  const [entries, setEntries] = useState<GuestEntryRecord[]>([])
  const [editingEntry, setEditingEntry] = useState<GuestEntryRecord | null>(null)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const response = await mediaContentService.guestbook.listAdmin({ page, per_page: 10 })
      setEntries(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load guest book entries.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [page])

  const resetForm = () => {
    setEditingEntry(null)
    setForm(initialForm)
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-college-ink">{editingEntry ? 'Edit Guest Entry' : 'Add Guest Entry'}</h1>
          {editingEntry ? <button className="btn-secondary" onClick={resetForm} type="button">Cancel Edit</button> : null}
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Guest Name
            <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, guest_name: event.target.value }))} value={form.guest_name} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Designation / Title
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} value={form.designation} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Organization
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))} value={form.organization} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Country
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} value={form.country} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Visit Date
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, visit_date: event.target.value }))} type="date" value={form.visit_date} />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Message
            <textarea className="form-input min-h-36 py-3" onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} value={form.message} />
          </label>
          <FileUploadZone accept="image/*" files={form.photo ? [form.photo] : []} helperText="Optional guest portrait, up to 5MB." label="Guest photo" onChange={(files) => setForm((current) => ({ ...current, photo: files[0] ?? null }))} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PublishToggle checked={form.is_published} onChange={(checked) => setForm((current) => ({ ...current, is_published: checked }))} />
            <button
              className="btn-primary"
              disabled={isSaving}
              onClick={async () => {
                try {
                  setIsSaving(true)
                  const payload = {
                    guest_name: form.guest_name,
                    designation: form.designation || undefined,
                    organization: form.organization || undefined,
                    country: form.country || undefined,
                    message: form.message,
                    visit_date: form.visit_date || undefined,
                    is_published: form.is_published,
                    photo: form.photo,
                  }

                  if (editingEntry) {
                    await mediaContentService.guestbook.update(editingEntry.id, payload)
                    toast.success('Guest entry updated.')
                  } else {
                    await mediaContentService.guestbook.create(payload)
                    toast.success('Guest entry created.')
                  }

                  resetForm()
                  await loadEntries()
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to save the guest entry.'))
                } finally {
                  setIsSaving(false)
                }
              }}
              type="button"
            >
              {isSaving ? 'Saving...' : editingEntry ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Guest Book Entries</h2>
          <p className="text-sm text-slate-500">Publish moving visitor messages to the public guest book or keep them in draft.</p>
        </div>
        {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
        {!isLoading ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Visit Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-college-ink">{entry.guest_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{entry.designation || entry.organization || 'Guest visitor'}</p>
                      </td>
                      <td className="px-4 py-4">{entry.country || 'Not listed'}</td>
                      <td className="px-4 py-4">{formatDateTime(entry.visit_date, 'Not recorded')}</td>
                      <td className="px-4 py-4">
                        <span className={`status-chip ${entry.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{entry.is_published ? 'published' : 'draft'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn-secondary min-h-9 px-3"
                            onClick={() => {
                              setEditingEntry(entry)
                              setForm({
                                guest_name: entry.guest_name,
                                designation: entry.designation ?? '',
                                organization: entry.organization ?? '',
                                country: entry.country ?? '',
                                message: entry.message,
                                visit_date: entry.visit_date ? entry.visit_date.slice(0, 10) : '',
                                is_published: entry.is_published,
                                photo: null,
                              })
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-secondary min-h-9 px-3"
                            onClick={async () => {
                              try {
                                await mediaContentService.guestbook.update(entry.id, {
                                  guest_name: entry.guest_name,
                                  designation: entry.designation ?? undefined,
                                  organization: entry.organization ?? undefined,
                                  country: entry.country ?? undefined,
                                  message: entry.message,
                                  visit_date: entry.visit_date ?? undefined,
                                  is_published: !entry.is_published,
                                })
                                toast.success(entry.is_published ? 'Entry moved to draft.' : 'Entry published.')
                                await loadEntries()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to update publication state.'))
                              }
                            }}
                            type="button"
                          >
                            {entry.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!window.confirm(`Delete "${entry.guest_name}" from the guest book?`)) {
                                return
                              }
                              try {
                                await mediaContentService.guestbook.delete(entry.id)
                                toast.success('Guest entry deleted.')
                                if (editingEntry?.id === entry.id) {
                                  resetForm()
                                }
                                await loadEntries()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to delete the guest entry.'))
                              }
                            }}
                            type="button"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={setPage} total={pagination.total} />
          </>
        ) : null}
      </section>
    </section>
  )
}

export default AdminGuestBookManager
