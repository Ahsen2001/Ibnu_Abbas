import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FileUploadZone from '../../components/FileUploadZone'
import LanguageTabEditor from '../../components/LanguageTabEditor'
import Pagination from '../../components/Pagination'
import PublishToggle from '../../components/PublishToggle'
import Skeleton from '../../components/Skeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { emptyLocalizedText, mediaContentService, type VideoCategory, type VideoMediaType, type VideoRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText } from '../../utils/localizedContent'

const initialForm = {
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  media_type: 'youtube' as VideoMediaType,
  youtube_url: '',
  category: 'general' as VideoCategory,
  event_date: '',
  is_published: false,
  thumbnail: null as File | null,
  file: null as File | null,
}

function AdminVideoManager() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null)
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const response = await mediaContentService.videos.list({ page, per_page: 10 })
      setVideos(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load video records.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [page])

  const resetForm = () => {
    setEditingVideo(null)
    setForm(initialForm)
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
      <section className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-college-ink">{editingVideo ? 'Edit Video' : 'Add Video'}</h1>
          {editingVideo ? <button className="btn-secondary" onClick={resetForm} type="button">Cancel Edit</button> : null}
        </div>
        <div className="mt-5 grid gap-4">
          <LanguageTabEditor label="Title" onChange={(value) => setForm((current) => ({ ...current, title: value }))} value={form.title} />
          <LanguageTabEditor label="Description" multiline onChange={(value) => setForm((current) => ({ ...current, description: value }))} rows={8} value={form.description} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Media Type
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, media_type: event.target.value as VideoMediaType }))} value={form.media_type}>
                <option value="youtube">YouTube</option>
                <option value="uploaded">Uploaded</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Category
              <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as VideoCategory }))} value={form.category}>
                <option value="event">Event</option>
                <option value="lecture">Lecture</option>
                <option value="graduation">Graduation</option>
                <option value="general">General</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Event Date
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, event_date: event.target.value }))} type="datetime-local" value={form.event_date} />
            </label>
          </div>

          {form.media_type === 'youtube' ? (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              YouTube URL
              <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, youtube_url: event.target.value }))} value={form.youtube_url} />
            </label>
          ) : (
            <FileUploadZone accept="video/*" files={form.file ? [form.file] : []} helperText="Upload MP4, MOV, AVI, or WEBM up to 150MB." label="Video file" onChange={(files) => setForm((current) => ({ ...current, file: files[0] ?? null }))} />
          )}

          <FileUploadZone accept="image/*" files={form.thumbnail ? [form.thumbnail] : []} helperText="Optional thumbnail. YouTube links can use the extracted thumbnail automatically." label="Thumbnail image" onChange={(files) => setForm((current) => ({ ...current, thumbnail: files[0] ?? null }))} />

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
                    media_type: form.media_type,
                    youtube_url: form.media_type === 'youtube' ? form.youtube_url : undefined,
                    category: form.category,
                    event_date: form.event_date || undefined,
                    is_published: form.is_published,
                    thumbnail: form.thumbnail,
                    file: form.media_type === 'uploaded' ? form.file : null,
                  }

                  if (editingVideo) {
                    await mediaContentService.videos.update(editingVideo.id, payload)
                    toast.success('Video updated.')
                  } else {
                    await mediaContentService.videos.create(payload)
                    toast.success('Video created.')
                  }

                  resetForm()
                  await loadVideos()
                } catch (error) {
                  toast.error(getApiErrorMessage(error, 'Unable to save the video entry.'))
                } finally {
                  setIsSaving(false)
                }
              }}
              type="button"
            >
              {isSaving ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
            </button>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-college-ink">Published Video Records</h2>
          <p className="text-sm text-slate-500">Manage video visibility, categories, and view statistics from here.</p>
        </div>
        {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
        {!isLoading ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-college-ink">{getLocalizedText(video.title, 'en')}</p>
                        <p className="mt-1 text-xs text-slate-500">{video.media_type} | {formatDateTime(video.event_date, 'No event date')}</p>
                      </td>
                      <td className="px-4 py-4 uppercase">{video.category}</td>
                      <td className="px-4 py-4">{video.views_count}</td>
                      <td className="px-4 py-4">
                        <span className={`status-chip ${video.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{video.is_published ? 'published' : 'draft'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn-secondary min-h-9 px-3"
                            onClick={() => {
                              setEditingVideo(video)
                              setForm({
                                title: video.title,
                                description: video.description ?? emptyLocalizedText(),
                                media_type: video.media_type,
                                youtube_url: video.youtube_url ?? '',
                                category: video.category,
                                event_date: video.event_date ? video.event_date.slice(0, 16) : '',
                                is_published: video.is_published,
                                thumbnail: null,
                                file: null,
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
                                await mediaContentService.videos.update(video.id, {
                                  title: video.title,
                                  description: video.description ?? emptyLocalizedText(),
                                  media_type: video.media_type,
                                  youtube_url: video.youtube_url ?? undefined,
                                  category: video.category,
                                  event_date: video.event_date ?? undefined,
                                  is_published: !video.is_published,
                                })
                                toast.success(video.is_published ? 'Video moved to draft.' : 'Video published.')
                                await loadVideos()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to update video visibility.'))
                              }
                            }}
                            type="button"
                          >
                            {video.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!window.confirm(`Delete "${getLocalizedText(video.title, 'en')}"?`)) {
                                return
                              }
                              try {
                                await mediaContentService.videos.delete(video.id)
                                toast.success('Video deleted.')
                                if (editingVideo?.id === video.id) {
                                  resetForm()
                                }
                                await loadVideos()
                              } catch (error) {
                                toast.error(getApiErrorMessage(error, 'Unable to delete the video.'))
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

export default AdminVideoManager
