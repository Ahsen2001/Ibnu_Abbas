import { Mic2, PlayCircle, PlaySquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import MediaCard from '../../components/MediaCard'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import Skeleton from '../../components/Skeleton'
import ViewCountBadge from '../../components/ViewCountBadge'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type IslamicLectureCategory, type IslamicLectureMediaType, type IslamicLectureRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale, type ContentLocale } from '../../utils/localizedContent'

const categories: { label: string; value: '' | IslamicLectureCategory }[] = [
  { label: 'All', value: '' },
  { label: 'Friday Sermon', value: 'friday_sermon' },
  { label: 'Lecture', value: 'lecture' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Debate', value: 'debate' },
]

const mediaTypes: { label: string; value: '' | IslamicLectureMediaType }[] = [
  { label: 'All Types', value: '' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'YouTube', value: 'youtube' },
]

const languageOptions: { label: string; value: ContentLocale }[] = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Arabic', value: 'ar' },
]

function mediaBadge(type: IslamicLectureMediaType) {
  switch (type) {
    case 'youtube':
      return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase text-red-700"><PlaySquare size={13} /> YouTube</span>
    case 'audio':
      return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700"><Mic2 size={13} /> Audio</span>
    default:
      return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase text-sky-700"><PlayCircle size={13} /> Video</span>
  }
}

function IslamicLectureList() {
  const { user } = useAuth()
  const defaultLocale = normalizeContentLocale(user?.preferred_locale)
  const [contentLocale, setContentLocale] = useState<ContentLocale>(defaultLocale)
  const [lectures, setLectures] = useState<IslamicLectureRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '' as '' | IslamicLectureCategory,
    mediaType: '' as '' | IslamicLectureMediaType,
    search: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.lectures
      .list({
        category: filters.category || undefined,
        media_type: filters.mediaType || undefined,
        search: filters.search || undefined,
        page: filters.page,
        per_page: 12,
      })
      .then((response) => {
        setLectures(response.data)
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.total,
        })
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load lectures right now.')))
      .finally(() => setIsLoading(false))
  }, [filters])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Islamic Content</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">Islamic Lectures</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Watch, listen, and revisit college lectures, seminars, and workshop recordings.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} lectures available
        </div>
      </section>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by title or speaker"
      />

      <div className="grid gap-4">
        <CategoryFilter categories={categories} onChange={(value) => setFilters((current) => ({ ...current, category: value as '' | IslamicLectureCategory, page: 1 }))} value={filters.category} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CategoryFilter categories={languageOptions} onChange={(value) => setContentLocale(value as ContentLocale)} value={contentLocale} />
          <CategoryFilter categories={mediaTypes} onChange={(value) => setFilters((current) => ({ ...current, mediaType: value as '' | IslamicLectureMediaType, page: 1 }))} value={filters.mediaType} />
        </div>
      </div>

      {isLoading && lectures.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="aspect-[4/5] w-full" key={`lecture-skeleton-${index}`} />)}
        </div>
      ) : null}

      {!isLoading && lectures.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-xl font-semibold text-college-ink">No lectures matched these filters</h2>
          <p className="mt-2 text-sm text-slate-500">Try removing one filter or searching with a different speaker or topic.</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lectures.map((lecture) => (
          <MediaCard
            actions={(
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ViewCountBadge count={lecture.views_count} />
                {mediaBadge(lecture.media_type)}
              </div>
            )}
            badge={mediaBadge(lecture.media_type)}
            imageUrl={lecture.thumbnail_url}
            meta={`${lecture.speaker_name} | ${formatDateTime(lecture.event_date, 'Date not recorded')}`}
            subtitle={getLocalizedText(lecture.description, contentLocale, 'Open this lecture to play the full recording or YouTube stream.')}
            title={getLocalizedText(lecture.title, contentLocale)}
            key={lecture.id}
            to={`/islamic/lectures/${lecture.id}`}
          />
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
    </div>
  )
}

export default IslamicLectureList
