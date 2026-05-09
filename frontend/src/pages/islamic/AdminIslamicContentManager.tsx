import { FileText, PlayCircle, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FileUploadZone from '../../components/FileUploadZone'
import LanguageTabEditor from '../../components/LanguageTabEditor'
import PublishToggle from '../../components/PublishToggle'
import Skeleton from '../../components/Skeleton'
import { getApiErrorMessage } from '../../services/errorService'
import {
  emptyLocalizedText,
  mediaContentService,
  type IslamicArticleCategory,
  type IslamicArticleRecord,
  type IslamicLectureCategory,
  type IslamicLectureMediaType,
  type IslamicLectureRecord,
  type LocalizedText,
} from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText } from '../../utils/localizedContent'

type TabKey = 'articles' | 'lectures'

const initialArticleForm = {
  title: emptyLocalizedText(),
  content: emptyLocalizedText(),
  author_name: '',
  category: 'general' as IslamicArticleCategory,
  tags: '',
  is_published: false,
  cover_image: null as File | null,
}

const initialLectureForm = {
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  speaker_name: '',
  category: 'lecture' as IslamicLectureCategory,
  media_type: 'youtube' as IslamicLectureMediaType,
  youtube_url: '',
  duration_minutes: '',
  event_date: '',
  tags: '',
  is_published: false,
  thumbnail: null as File | null,
  file: null as File | null,
}

function AdminIslamicContentManager() {
  const [activeTab, setActiveTab] = useState<TabKey>('articles')
  const [articleForm, setArticleForm] = useState(initialArticleForm)
  const [lectureForm, setLectureForm] = useState(initialLectureForm)
  const [editingArticle, setEditingArticle] = useState<IslamicArticleRecord | null>(null)
  const [editingLecture, setEditingLecture] = useState<IslamicLectureRecord | null>(null)
  const [articles, setArticles] = useState<IslamicArticleRecord[]>([])
  const [lectures, setLectures] = useState<IslamicLectureRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadContent = async () => {
    setIsLoading(true)

    try {
      const [articlesResponse, lecturesResponse] = await Promise.all([
        mediaContentService.articles.list({ per_page: 50 }),
        mediaContentService.lectures.list({ per_page: 50 }),
      ])

      setArticles(articlesResponse.data)
      setLectures(lecturesResponse.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load Islamic content for management.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const articleTags = useMemo(() => articleForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean), [articleForm.tags])
  const lectureTags = useMemo(() => lectureForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean), [lectureForm.tags])

  const startEditingArticle = (article: IslamicArticleRecord) => {
    setEditingArticle(article)
    setArticleForm({
      title: article.title,
      content: article.content,
      author_name: article.author_name,
      category: article.category,
      tags: article.tags?.join(', ') ?? '',
      is_published: article.is_published,
      cover_image: null,
    })
    setActiveTab('articles')
  }

  const startEditingLecture = (lecture: IslamicLectureRecord) => {
    setEditingLecture(lecture)
    setLectureForm({
      title: lecture.title,
      description: lecture.description ?? emptyLocalizedText(),
      speaker_name: lecture.speaker_name,
      category: lecture.category,
      media_type: lecture.media_type,
      youtube_url: lecture.youtube_url ?? '',
      duration_minutes: lecture.duration_minutes ? String(lecture.duration_minutes) : '',
      event_date: lecture.event_date ? lecture.event_date.slice(0, 16) : '',
      tags: lecture.tags?.join(', ') ?? '',
      is_published: lecture.is_published,
      thumbnail: null,
      file: null,
    })
    setActiveTab('lectures')
  }

  const resetArticleForm = () => {
    setEditingArticle(null)
    setArticleForm(initialArticleForm)
  }

  const resetLectureForm = () => {
    setEditingLecture(null)
    setLectureForm(initialLectureForm)
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Islamic Content</p>
        <h1 className="mt-2 text-3xl font-bold text-college-ink">Islamic Content Manager</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Publish articles and lectures with multilingual fields, upload handling, and visibility controls in one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className={activeTab === 'articles' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('articles')} type="button">
          <FileText size={16} />
          Articles
        </button>
        <button className={activeTab === 'lectures' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('lectures')} type="button">
          <PlayCircle size={16} />
          Lectures
        </button>
      </div>

      {activeTab === 'articles' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
          <section className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-college-ink">{editingArticle ? 'Edit Article' : 'New Article'}</h2>
              {editingArticle ? <button className="btn-secondary" onClick={resetArticleForm} type="button">Cancel Edit</button> : null}
            </div>
            <div className="mt-5 grid gap-4">
              <LanguageTabEditor label="Title" onChange={(value) => setArticleForm((current) => ({ ...current, title: value }))} value={articleForm.title} />
              <LanguageTabEditor label="Content" multiline onChange={(value) => setArticleForm((current) => ({ ...current, content: value }))} rows={10} value={articleForm.content} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Author Name
                  <input className="form-input" onChange={(event) => setArticleForm((current) => ({ ...current, author_name: event.target.value }))} value={articleForm.author_name} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Category
                  <select className="form-input" onChange={(event) => setArticleForm((current) => ({ ...current, category: event.target.value as IslamicArticleCategory }))} value={articleForm.category}>
                    <option value="fiqh">Fiqh</option>
                    <option value="aqeedah">Aqeedah</option>
                    <option value="seerah">Seerah</option>
                    <option value="quran_tafsir">Quran Tafsir</option>
                    <option value="hadith">Hadith</option>
                    <option value="general">General</option>
                    <option value="fatwa">Fatwa</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Tags
                <input className="form-input" onChange={(event) => setArticleForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Comma separated tags" value={articleForm.tags} />
              </label>
              <FileUploadZone accept="image/*" files={articleForm.cover_image ? [articleForm.cover_image] : []} helperText="Optional cover image, JPG/PNG/WEBP up to 5MB." label="Article cover image" onChange={(files) => setArticleForm((current) => ({ ...current, cover_image: files[0] ?? null }))} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PublishToggle checked={articleForm.is_published} onChange={(checked) => setArticleForm((current) => ({ ...current, is_published: checked }))} />
                <button
                  className="btn-primary"
                  disabled={isSaving}
                  onClick={async () => {
                    try {
                      setIsSaving(true)
                      const payload = {
                        title: articleForm.title,
                        content: articleForm.content,
                        author_name: articleForm.author_name,
                        category: articleForm.category,
                        tags: articleTags,
                        is_published: articleForm.is_published,
                        cover_image: articleForm.cover_image,
                      }

                      if (editingArticle) {
                        await mediaContentService.articles.update(editingArticle.id, payload)
                        toast.success('Article updated.')
                      } else {
                        await mediaContentService.articles.create(payload)
                        toast.success('Article created.')
                      }

                      resetArticleForm()
                      await loadContent()
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Unable to save the Islamic article.'))
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  type="button"
                >
                  {isSaving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-college-ink">Article Library</h2>
              <p className="text-sm text-slate-500">Drafts and published articles, including their view counts and status.</p>
            </div>
            {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
            {!isLoading ? (
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
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-college-ink">{getLocalizedText(article.title, 'en')}</p>
                          <p className="mt-1 text-xs text-slate-500">{article.author_name}</p>
                        </td>
                        <td className="px-4 py-4 uppercase">{article.category}</td>
                        <td className="px-4 py-4">{article.views_count}</td>
                        <td className="px-4 py-4">
                          <span className={`status-chip ${article.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{article.is_published ? 'published' : 'draft'}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="btn-secondary min-h-9 px-3" onClick={() => startEditingArticle(article)} type="button">Edit</button>
                            <button
                              className="btn-secondary min-h-9 px-3"
                              onClick={async () => {
                                try {
                                  await mediaContentService.articles.update(article.id, {
                                    title: article.title as LocalizedText,
                                    content: article.content as LocalizedText,
                                    author_name: article.author_name,
                                    category: article.category,
                                    tags: article.tags ?? [],
                                    is_published: !article.is_published,
                                  })
                                  toast.success(article.is_published ? 'Article moved to draft.' : 'Article published.')
                                  await loadContent()
                                } catch (error) {
                                  toast.error(getApiErrorMessage(error, 'Unable to update article visibility.'))
                                }
                              }}
                              type="button"
                            >
                              {article.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                              onClick={async () => {
                                if (!window.confirm(`Delete "${getLocalizedText(article.title, 'en')}"?`)) {
                                  return
                                }
                                try {
                                  await mediaContentService.articles.delete(article.id)
                                  toast.success('Article deleted.')
                                  if (editingArticle?.id === article.id) {
                                    resetArticleForm()
                                  }
                                  await loadContent()
                                } catch (error) {
                                  toast.error(getApiErrorMessage(error, 'Unable to delete the article.'))
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
            ) : null}
          </section>
        </div>
      ) : null}

      {activeTab === 'lectures' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
          <section className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-college-ink">{editingLecture ? 'Edit Lecture' : 'New Lecture'}</h2>
              {editingLecture ? <button className="btn-secondary" onClick={resetLectureForm} type="button">Cancel Edit</button> : null}
            </div>
            <div className="mt-5 grid gap-4">
              <LanguageTabEditor label="Title" onChange={(value) => setLectureForm((current) => ({ ...current, title: value }))} value={lectureForm.title} />
              <LanguageTabEditor label="Description" multiline onChange={(value) => setLectureForm((current) => ({ ...current, description: value }))} rows={8} value={lectureForm.description} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Speaker Name
                  <input className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, speaker_name: event.target.value }))} value={lectureForm.speaker_name} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Category
                  <select className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, category: event.target.value as IslamicLectureCategory }))} value={lectureForm.category}>
                    <option value="friday_sermon">Friday Sermon</option>
                    <option value="lecture">Lecture</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                    <option value="debate">Debate</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Media Type
                  <select className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, media_type: event.target.value as IslamicLectureMediaType }))} value={lectureForm.media_type}>
                    <option value="youtube">YouTube</option>
                    <option value="video">Video Upload</option>
                    <option value="audio">Audio Upload</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Event Date
                  <input className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, event_date: event.target.value }))} type="datetime-local" value={lectureForm.event_date} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Duration (minutes)
                  <input className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, duration_minutes: event.target.value }))} type="number" value={lectureForm.duration_minutes} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Tags
                  <input className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Comma separated tags" value={lectureForm.tags} />
                </label>
              </div>

              {lectureForm.media_type === 'youtube' ? (
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  YouTube URL
                  <input className="form-input" onChange={(event) => setLectureForm((current) => ({ ...current, youtube_url: event.target.value }))} value={lectureForm.youtube_url} />
                </label>
              ) : (
                <FileUploadZone accept={lectureForm.media_type === 'audio' ? 'audio/*' : 'video/*'} files={lectureForm.file ? [lectureForm.file] : []} helperText="Upload a lecture audio or video file." label="Lecture media file" onChange={(files) => setLectureForm((current) => ({ ...current, file: files[0] ?? null }))} />
              )}

              <FileUploadZone accept="image/*" files={lectureForm.thumbnail ? [lectureForm.thumbnail] : []} helperText="Optional custom thumbnail. YouTube entries can also auto-use the YouTube thumbnail." label="Thumbnail image" onChange={(files) => setLectureForm((current) => ({ ...current, thumbnail: files[0] ?? null }))} />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <PublishToggle checked={lectureForm.is_published} onChange={(checked) => setLectureForm((current) => ({ ...current, is_published: checked }))} />
                <button
                  className="btn-primary"
                  disabled={isSaving}
                  onClick={async () => {
                    try {
                      setIsSaving(true)
                      const payload = {
                        title: lectureForm.title,
                        description: lectureForm.description,
                        speaker_name: lectureForm.speaker_name,
                        category: lectureForm.category,
                        media_type: lectureForm.media_type,
                        youtube_url: lectureForm.media_type === 'youtube' ? lectureForm.youtube_url : undefined,
                        duration_minutes: lectureForm.duration_minutes ? Number(lectureForm.duration_minutes) : null,
                        event_date: lectureForm.event_date || undefined,
                        tags: lectureTags,
                        is_published: lectureForm.is_published,
                        thumbnail: lectureForm.thumbnail,
                        file: lectureForm.media_type === 'youtube' ? null : lectureForm.file,
                      }

                      if (editingLecture) {
                        await mediaContentService.lectures.update(editingLecture.id, payload)
                        toast.success('Lecture updated.')
                      } else {
                        await mediaContentService.lectures.create(payload)
                        toast.success('Lecture created.')
                      }

                      resetLectureForm()
                      await loadContent()
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Unable to save the Islamic lecture.'))
                    } finally {
                      setIsSaving(false)
                    }
                  }}
                  type="button"
                >
                  {isSaving ? 'Saving...' : editingLecture ? 'Update Lecture' : 'Create Lecture'}
                </button>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-college-ink">Lecture Library</h2>
              <p className="text-sm text-slate-500">Uploaded or linked lectures, with visibility, date, and views at a glance.</p>
            </div>
            {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : null}
            {!isLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Media</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {lectures.map((lecture) => (
                      <tr key={lecture.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-college-ink">{getLocalizedText(lecture.title, 'en')}</p>
                          <p className="mt-1 text-xs text-slate-500">{lecture.speaker_name}</p>
                        </td>
                        <td className="px-4 py-4 uppercase">{lecture.media_type}</td>
                        <td className="px-4 py-4">{formatDateTime(lecture.event_date, 'Not scheduled')}</td>
                        <td className="px-4 py-4">{lecture.views_count}</td>
                        <td className="px-4 py-4">
                          <span className={`status-chip ${lecture.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{lecture.is_published ? 'published' : 'draft'}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button className="btn-secondary min-h-9 px-3" onClick={() => startEditingLecture(lecture)} type="button">Edit</button>
                            <button
                              className="btn-secondary min-h-9 px-3"
                              onClick={async () => {
                                try {
                                  await mediaContentService.lectures.update(lecture.id, {
                                    title: lecture.title as LocalizedText,
                                    description: (lecture.description ?? emptyLocalizedText()) as LocalizedText,
                                    speaker_name: lecture.speaker_name,
                                    category: lecture.category,
                                    media_type: lecture.media_type,
                                    youtube_url: lecture.youtube_url ?? undefined,
                                    duration_minutes: lecture.duration_minutes,
                                    event_date: lecture.event_date ?? undefined,
                                    tags: lecture.tags ?? [],
                                    is_published: !lecture.is_published,
                                  })
                                  toast.success(lecture.is_published ? 'Lecture moved to draft.' : 'Lecture published.')
                                  await loadContent()
                                } catch (error) {
                                  toast.error(getApiErrorMessage(error, 'Unable to update lecture visibility.'))
                                }
                              }}
                              type="button"
                            >
                              {lecture.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
                              onClick={async () => {
                                if (!window.confirm(`Delete "${getLocalizedText(lecture.title, 'en')}"?`)) {
                                  return
                                }
                                try {
                                  await mediaContentService.lectures.delete(lecture.id)
                                  toast.success('Lecture deleted.')
                                  if (editingLecture?.id === lecture.id) {
                                    resetLectureForm()
                                  }
                                  await loadContent()
                                } catch (error) {
                                  toast.error(getApiErrorMessage(error, 'Unable to delete the lecture.'))
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
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default AdminIslamicContentManager
