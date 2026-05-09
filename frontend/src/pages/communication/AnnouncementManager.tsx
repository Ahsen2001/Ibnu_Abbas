import { Bold, Clock3, Eye, EyeOff, Italic, List, Megaphone, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import FilterPanel from '../../components/FilterPanel'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import Skeleton from '../../components/Skeleton'
import { communicationService, type AnnouncementPayload, type AnnouncementRecord } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

type AnnouncementFormState = {
  id: number | null
  title: string
  body: string
  target_audience: 'all' | 'students' | 'teachers' | 'admin'
  department: 'shareea' | 'hifl' | ''
  published_at: string
  expires_at: string
}

const emptyForm: AnnouncementFormState = {
  id: null,
  title: '',
  body: '',
  target_audience: 'all',
  department: '',
  published_at: '',
  expires_at: '',
}

function getStatusChip(status: string) {
  switch (status) {
    case 'published':
      return 'bg-emerald-50 text-emerald-700'
    case 'archived':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}

function AnnouncementManager() {
  const [form, setForm] = useState<AnnouncementFormState>(emptyForm)
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const isInitialLoading = isLoading && announcements.length === 0

  const loadAnnouncements = async () => {
    setIsLoading(true)
    try {
      const response = await communicationService.listAnnouncements({
        ...filters,
        per_page: 10,
      })
      setAnnouncements(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load announcements.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const applyFormatting = (before: string, after = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = form.body.slice(start, end)
    const nextBody = `${form.body.slice(0, start)}${before}${selectedText}${after}${form.body.slice(end)}`

    setForm((current) => ({ ...current, body: nextBody }))
  }

  const hydrateForm = (announcement: AnnouncementRecord) => {
    setForm({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      target_audience: announcement.target_audience,
      department: announcement.department ?? '',
      published_at: announcement.published_at ? announcement.published_at.slice(0, 16) : '',
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : '',
    })
  }

  const persistAnnouncement = async (mode: 'draft' | 'schedule' | 'publish') => {
    setIsSaving(true)

    const payload: AnnouncementPayload = {
      title: form.title,
      body: form.body,
      target_audience: form.target_audience,
      department: form.department,
      published_at: mode === 'publish'
        ? new Date().toISOString()
        : form.published_at || null,
      expires_at: form.expires_at || null,
      status: mode === 'draft' ? 'draft' : 'published',
    }

    if (mode === 'schedule' && !form.published_at) {
      toast.error('Choose a publish date and time before scheduling.')
      setIsSaving(false)
      return
    }

    try {
      const saved = form.id
        ? await communicationService.updateAnnouncement(form.id, payload)
        : await communicationService.createAnnouncement(payload)

      toast.success(mode === 'draft' ? 'Announcement draft saved.' : mode === 'schedule' ? 'Announcement scheduled.' : 'Announcement published.')
      hydrateForm(saved)
      await loadAnnouncements()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save the announcement.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <div className="grid gap-5">
        <section className="panel p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-college-green">Communication</p>
              <h1 className="mt-2 text-3xl font-bold text-college-ink">Announcement Manager</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Write college announcements, target the right audience, and control publish or archive timing from one place.</p>
            </div>
            <button className="btn-secondary" onClick={() => setForm(emptyForm)} type="button">
              <PlusCircle size={16} />
              New
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Title
              <input
                className="form-input"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                value={form.title}
              />
            </label>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary min-h-9 px-3" onClick={() => applyFormatting('<strong>', '</strong>')} type="button"><Bold size={15} /></button>
                <button className="btn-secondary min-h-9 px-3" onClick={() => applyFormatting('<em>', '</em>')} type="button"><Italic size={15} /></button>
                <button className="btn-secondary min-h-9 px-3" onClick={() => applyFormatting('<ul>\n<li>', '</li>\n</ul>')} type="button"><List size={15} /></button>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Body
                <textarea
                  className="form-input min-h-52 py-3"
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  ref={textareaRef}
                  value={form.body}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Audience
                <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, target_audience: event.target.value as AnnouncementFormState['target_audience'] }))} value={form.target_audience}>
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="teachers">Teachers</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Department
                <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, department: event.target.value as AnnouncementFormState['department'] }))} value={form.department}>
                  <option value="">All Departments</option>
                  <option value="shareea">Shareea</option>
                  <option value="hifl">Hifl</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Publish At
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} type="datetime-local" value={form.published_at} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Expires At
                <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} type="datetime-local" value={form.expires_at} />
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-secondary" disabled={isSaving} onClick={() => persistAnnouncement('draft')} type="button">
              <Save size={16} />
              Save Draft
            </button>
            <button className="btn-secondary" disabled={isSaving} onClick={() => persistAnnouncement('schedule')} type="button">
              <Clock3 size={16} />
              Schedule
            </button>
            <button className="btn-primary" disabled={isSaving} onClick={() => persistAnnouncement('publish')} type="button">
              <Megaphone size={16} />
              Publish Now
            </button>
            {form.id ? (
              <button
                className="btn-secondary text-slate-700"
                disabled={isSaving}
                onClick={async () => {
                  try {
                    await communicationService.archiveAnnouncement(form.id as number)
                    toast.success('Announcement archived.')
                    setForm(emptyForm)
                    await loadAnnouncements()
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to archive the announcement.'))
                  }
                }}
                type="button"
              >
                <EyeOff size={16} />
                Archive
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <section className="grid gap-5">
        <SearchBar
          initialValue={filters.search}
          onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
          placeholder="Search announcements"
        />

        <FilterPanel
          onClear={() => setFilters({ search: '', status: '', department: '', page: 1 })}
          title="Announcement Filters"
        >
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Status
            <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))} value={filters.status}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
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
        </FilterPanel>

        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-college-ink">Published Announcements</h2>
            {isLoading && announcements.length > 0 ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-college-green">Refreshing announcements...</p>
            ) : null}
          </div>
          <div className="grid gap-3 p-4">
            {isInitialLoading ? (
              <>
                {Array.from({ length: 3 }, (_, index) => (
                  <article className="rounded-xl border border-slate-200 p-4" key={`announcement-manager-skeleton-${index}`}>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-40" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                  </article>
                ))}
              </>
            ) : null}
            {!isLoading && announcements.length === 0 ? <p className="text-sm text-slate-500">No announcements matched the current filters.</p> : null}
            {announcements.map((announcement) => (
              <article className="rounded-xl border border-slate-200 p-4" key={announcement.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-college-ink">{announcement.title}</h3>
                      <span className={`status-chip ${getStatusChip(announcement.status)}`}>{announcement.status}</span>
                    </div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Audience: {announcement.target_audience} {announcement.department ? `| Department: ${announcement.department}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary min-h-9 px-3" onClick={() => hydrateForm(announcement)} type="button"><Pencil size={15} />Edit</button>
                    <button
                      className="btn-secondary min-h-9 px-3"
                      onClick={async () => {
                        try {
                          await communicationService.publishAnnouncement(announcement.id, {
                            published_at: announcement.published_at,
                            expires_at: announcement.expires_at,
                          })
                          toast.success('Announcement published.')
                          await loadAnnouncements()
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to publish the announcement.'))
                        }
                      }}
                      type="button"
                    ><Eye size={15} />Publish</button>
                    <button
                      className="btn-secondary min-h-9 px-3"
                      onClick={async () => {
                        try {
                          await communicationService.archiveAnnouncement(announcement.id)
                          toast.success('Announcement archived.')
                          await loadAnnouncements()
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to archive the announcement.'))
                        }
                      }}
                      type="button"
                    ><EyeOff size={15} />Archive</button>
                    <button
                      className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${announcement.title}"?`)) {
                          return
                        }

                        try {
                          await communicationService.deleteAnnouncement(announcement.id)
                          toast.success('Announcement deleted.')
                          if (form.id === announcement.id) {
                            setForm(emptyForm)
                          }
                          await loadAnnouncements()
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to delete the announcement.'))
                        }
                      }}
                      type="button"
                    ><Trash2 size={15} />Delete</button>
                  </div>
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: announcement.body }} />
                <p className="mt-3 text-xs text-slate-400">
                  Published: {announcement.published_at ? new Date(announcement.published_at).toLocaleString() : 'Not published yet'}
                  {announcement.expires_at ? ` | Expires: ${new Date(announcement.expires_at).toLocaleString()}` : ''}
                </p>
              </article>
            ))}
          </div>

          <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
        </section>
      </section>
    </section>
  )
}

export default AnnouncementManager
