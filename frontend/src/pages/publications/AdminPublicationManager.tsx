import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FileUploadZone from '../../components/FileUploadZone'
import LanguageTabEditor from '../../components/LanguageTabEditor'
import Pagination from '../../components/Pagination'
import PublishToggle from '../../components/PublishToggle'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import {
  emptyLocalizedText,
  mediaContentService,
  type PublicationCategory,
  type PublicationRecord,
} from '../../services/mediaContentService'
import { getLocalizedText } from '../../utils/localizedContent'

const initialForm = {
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  category: 'newsletter' as PublicationCategory,
  issue_number: '',
  published_year: String(new Date().getFullYear()),
  published_date: '',
  author_editor: '',
  department: '',
  is_published: false,
  cover_image: null as File | null,
  file: null as File | null,
}

function AdminPublicationManager() {
  const { role } = useAuth()
  const isAdmin = role === 'super_admin' || role === 'admin_staff'
  const canUpload = isAdmin || role === 'teacher'
  const [publications, setPublications] = useState<PublicationRecord[]>([])
  const [editingPublication, setEditingPublication] = useState<PublicationRecord | null>(null)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const loadPublications = async () => {
    setIsLoading(true)
    try {
      const response = await mediaContentService.publications.list({ page, per_page: 10 })
      setPublications(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load publications for management.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPublications()
  }, [page])

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 8 }, (_, index) => String(currentYear - index))
  }, [])

  const resetForm = () => {
    setEditingPublication(null)
    setForm(initialForm)
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
      {canUpload ? (
      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-college-ink">{editingPublication ? 'Edit Publication' : 'Upload Publication'}</h1>
          {editingPublication ? <button className="btn-secondary" onClick={resetForm} type="button">Cancel Edit</button> : null}
        </div>
        {!isAdmin ? <p className="mt-3 text-sm leading-6 text-slate-600">Teacher uploads stay in draft until an administrator reviews and publishes them.</p> : null}
        <div className="mt-5 grid gap-4">
          <LanguageTabEditor label="Title" onChange={(value) => setForm((current) => ({ ...current, title: value }))} value={form.title} />
          <LanguageTabEditor label="Description" multiline onChange={(value) => setForm((current) => ({ ...current, description: value }))} rows={8} value={form.description} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Category
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as PublicationCategory }))} value={form.category}>
                <option value="thikra_magazine">Thikra Magazine</option>
                <option value="syllabus_book">Syllabus Book</option>
                <option value="souvenir">Souvenir</option>
                <option value="general_knowledge">General Knowledge</option>
                <option value="research_journal">Research Journal</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Issue Number
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, issue_number: event.target.value }))} value={form.issue_number} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Published Year
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, published_year: event.target.value }))} value={form.published_year}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Published Date
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, published_date: event.target.value }))} type="date" value={form.published_date} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Author / Editor
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, author_editor: event.target.value }))} value={form.author_editor} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Department
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} value={form.department}>
                <option value="">All departments</option>
                <option value="shareea">Shareea</option>
                <option value="hifl">Hifl</option>
              </select>
            </label>
          </div>

          <FileUploadZone accept="image/*" files={form.cover_image ? [form.cover_image] : []} helperText="Optional cover image, up to 5MB." label="Cover image" onChange={(files) => setForm((current) => ({ ...current, cover_image: files[0] ?? null }))} />
          <FileUploadZone accept="application/pdf" files={form.file ? [form.file] : []} helperText="Publication PDF, up to 25MB." label="Publication PDF" onChange={(files) => setForm((current) => ({ ...current, file: files[0] ?? null }))} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <PublishToggle checked={form.is_published} onChange={(checked) => setForm((current) => ({ ...current, is_published: checked }))} />
            <button
              className="btn-primary"
              disabled={isSaving}
              onClick={async () => {
                try {
                  setIsSaving(true)
                  const payload = {
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    issue_number: form.issue_number || undefined,
                    published_year: Number(form.published_year),
                    published_date: form.published_date || undefined,
                    author_editor: form.author_editor || undefined,
                    department: form.department || undefined,
                    is_published: form.is_published,
                    cover_image: form.cover_image,
                    file: form.file,
                  }

                  if (editingPublication) {
                    await mediaContentService.publications.update(editingPublication.id, payload)
                    toast.success('Publication updated.')
                  } else {
                    await mediaContentService.publications.create(payload)
                    toast.success('Publication uploaded.')
                  }

                  resetForm()
                  await loadPublications()
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to save the publication.'))
                } finally {
                  setIsSaving(false)
                }
              }}
              type="button"
            >
              {isSaving ? 'Saving...' : editingPublication ? 'Update Publication' : 'Upload Publication'}
            </button>
          </div>
        </div>
      </section>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Publication Records</h2>
          <p className="text-sm text-slate-500">Track publishing status, issue years, and download activity across the library.</p>
        </div>
        {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
        {!isLoading ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Downloads</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {publications.map((publication) => (
                    <tr key={publication.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-college-ink">{getLocalizedText(publication.title, 'en')}</p>
                        <p className="mt-1 text-xs text-slate-500">{publication.category} | {publication.author_editor || 'Editorial team'}</p>
                      </td>
                      <td className="px-4 py-4">{publication.published_year}</td>
                      <td className="px-4 py-4">{publication.download_count}</td>
                      <td className="px-4 py-4">
                        <span className={`status-chip ${publication.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{publication.is_published ? 'published' : 'draft'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn-secondary min-h-9 px-3"
                            disabled={!isAdmin}
                            onClick={() => {
                              if (!isAdmin) {
                                return
                              }
                              setEditingPublication(publication)
                              setForm({
                                title: publication.title,
                                description: publication.description ?? emptyLocalizedText(),
                                category: publication.category,
                                issue_number: publication.issue_number ?? '',
                                published_year: String(publication.published_year),
                                published_date: publication.published_date ? publication.published_date.slice(0, 10) : '',
                                author_editor: publication.author_editor ?? '',
                                department: publication.department ?? '',
                                is_published: publication.is_published,
                                cover_image: null,
                                file: null,
                              })
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          {isAdmin ? (
                            <>
                              <button
                                className="btn-secondary min-h-9 px-3"
                                onClick={async () => {
                                  try {
                                    await mediaContentService.publications.update(publication.id, {
                                      title: publication.title,
                                      description: publication.description ?? emptyLocalizedText(),
                                      category: publication.category,
                                      issue_number: publication.issue_number ?? undefined,
                                      published_year: publication.published_year,
                                      published_date: publication.published_date ?? undefined,
                                      author_editor: publication.author_editor ?? undefined,
                                      department: publication.department ?? undefined,
                                      is_published: !publication.is_published,
                                    })
                                    toast.success(publication.is_published ? 'Publication moved to draft.' : 'Publication published.')
                                    await loadPublications()
                                  } catch (error) {
                                    toast.error(getApiErrorMessage(error, 'Unable to update publication state.'))
                                  }
                                }}
                                type="button"
                              >
                                {publication.is_published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                                onClick={async () => {
                                  if (!window.confirm(`Delete "${getLocalizedText(publication.title, 'en')}"?`)) {
                                    return
                                  }
                                  try {
                                    await mediaContentService.publications.delete(publication.id)
                                    toast.success('Publication deleted.')
                                    if (editingPublication?.id === publication.id) {
                                      resetForm()
                                    }
                                    await loadPublications()
                                  } catch (error) {
                                    toast.error(getApiErrorMessage(error, 'Unable to delete the publication.'))
                                  }
                                }}
                                type="button"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Awaiting admin review</span>
                          )}
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

export default AdminPublicationManager
