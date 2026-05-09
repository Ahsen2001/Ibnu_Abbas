import { CalendarDays, Download, Mic2, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import Skeleton from '../../components/Skeleton'
import ViewCountBadge from '../../components/ViewCountBadge'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type IslamicLectureRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, isRtlLocale, normalizeContentLocale, type ContentLocale } from '../../utils/localizedContent'

const languageOptions: { label: string; value: ContentLocale }[] = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Arabic', value: 'ar' },
]

function getYoutubeEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null
  }

  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

function IslamicLecturePlayer() {
  const { lectureId } = useParams()
  const { user } = useAuth()
  const defaultLocale = normalizeContentLocale(user?.preferred_locale)
  const [contentLocale, setContentLocale] = useState<ContentLocale>(defaultLocale)
  const [lecture, setLecture] = useState<IslamicLectureRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!lectureId) {
      return
    }

    setIsLoading(true)
    mediaContentService.lectures
      .getById(Number(lectureId))
      .then(setLecture)
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load this Islamic lecture.')))
      .finally(() => setIsLoading(false))
  }, [lectureId])

  const relatedLectures = useMemo(() => lecture?.related_lectures ?? [], [lecture])
  const isRtl = isRtlLocale(contentLocale)
  const embedUrl = getYoutubeEmbedUrl(lecture?.youtube_url)

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
        <Skeleton className="h-[28rem] w-full" />
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-bold text-college-ink">Lecture unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">This lecture could not be loaded or is not published yet.</p>
          <Link className="btn-primary mt-5 inline-flex" to="/islamic/lectures">
            Return to lectures
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="btn-secondary" to="/islamic/lectures">Back to Lectures</Link>
        <CategoryFilter categories={languageOptions} onChange={(value) => setContentLocale(value as ContentLocale)} value={contentLocale} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)]">
        <section className="panel p-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            {lecture.media_type === 'youtube' && embedUrl ? (
              <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full" src={embedUrl} title={getLocalizedText(lecture.title, contentLocale)} />
            ) : null}
            {lecture.media_type === 'video' && lecture.media_url ? (
              <video className="aspect-video w-full" controls poster={lecture.thumbnail_url ?? undefined} src={lecture.media_url} />
            ) : null}
            {lecture.media_type === 'audio' && lecture.media_url ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-5 bg-gradient-to-br from-college-green via-teal-700 to-college-ink p-6 text-white">
                <Mic2 size={42} />
                <audio className="w-full max-w-xl" controls src={lecture.media_url} />
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">{lecture.category.replace('_', ' ')}</p>
            <h1 className="mt-3 text-3xl font-bold text-college-ink">{getLocalizedText(lecture.title, contentLocale)}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><UserRound size={14} /> {lecture.speaker_name}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDateTime(lecture.event_date, 'Date not recorded')}</span>
              <ViewCountBadge count={lecture.views_count} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {lecture.tags?.map((tag) => (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={tag}>{tag}</span>
              ))}
            </div>
            <div className="mt-6 text-sm leading-7 text-slate-600" dir={isRtl ? 'rtl' : 'ltr'}>
              {getLocalizedText(lecture.description, contentLocale, 'No lecture description was added.')}
            </div>
            {lecture.media_download_url ? (
              <button className="btn-secondary mt-6" onClick={() => triggerDownload(lecture.media_download_url)} type="button">
                <Download size={16} />
                Open Media
              </button>
            ) : null}
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-college-ink">Speaker</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {lecture.speaker_name} delivered this {lecture.category.replace('_', ' ')} session for the college community.
            </p>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-college-ink">Related Lectures</h2>
            <div className="mt-4 grid gap-3">
              {relatedLectures.length === 0 ? <p className="text-sm text-slate-500">No related lectures available yet.</p> : null}
              {relatedLectures.map((item) => (
                <Link className="rounded-2xl border border-slate-200 p-3 transition hover:border-college-green hover:bg-teal-50/50" key={item.id} to={`/islamic/lectures/${item.id}`}>
                  <p className="font-semibold text-college-ink">{getLocalizedText(item.title, contentLocale)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.media_type} | {item.category.replace('_', ' ')}</p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default IslamicLecturePlayer
