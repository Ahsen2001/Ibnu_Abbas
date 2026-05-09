import { PlayCircle } from 'lucide-react'
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
import { mediaContentService, type VideoCategory, type VideoRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'
import VideoPlayerModal from './VideoPlayerModal'

const categoryOptions: { label: string; value: '' | VideoCategory }[] = [
  { label: 'All', value: '' },
  { label: 'Events', value: 'event' },
  { label: 'Lectures', value: 'lecture' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'General', value: 'general' },
]

function VideoGallery() {
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '' as '' | VideoCategory,
    search: '',
    sort: 'newest',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const response = await mediaContentService.videos.list({
        category: filters.category || undefined,
        search: filters.search || undefined,
        sort: filters.sort === 'most_viewed' ? 'most_viewed' : undefined,
        page: filters.page,
        per_page: 12,
      })
      setVideos(response.data)
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load the video gallery right now.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [filters])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Video Gallery</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">College Video Library</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Revisit events, lectures, and special moments through the college’s published video archive.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} videos available
        </div>
      </section>

      <SearchBar initialValue={filters.search} onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))} placeholder="Search by title" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryFilter categories={categoryOptions} onChange={(value) => setFilters((current) => ({ ...current, category: value as '' | VideoCategory, page: 1 }))} value={filters.category} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Sort
          <select className="form-input min-w-44" onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))} value={filters.sort}>
            <option value="newest">Newest first</option>
            <option value="most_viewed">Most viewed</option>
          </select>
        </label>
      </div>

      {isLoading && videos.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="aspect-[4/5] w-full" key={`video-skeleton-${index}`} />)}
        </div>
      ) : null}

      {!isLoading && videos.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-xl font-semibold text-college-ink">No videos matched the current filters</h2>
          <p className="mt-2 text-sm text-slate-500">Try another category or search phrase to widen the results.</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <MediaCard
            actions={(
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ViewCountBadge count={video.views_count} />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDateTime(video.event_date, 'Date not recorded')}</span>
              </div>
            )}
            badge={<span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-college-ink"><PlayCircle size={13} /> {video.media_type}</span>}
            imageUrl={video.thumbnail_url}
            meta={video.category}
            onClick={async () => {
              try {
                const detail = await mediaContentService.videos.getById(video.id)
                setSelectedVideo(detail)
              } catch (error) {
                toast.error(getApiErrorMessage(error, 'Unable to open this video.'))
              }
            }}
            subtitle={getLocalizedText(video.description, locale, 'Open this video to play the full recording or stream.')}
            title={getLocalizedText(video.title, locale)}
            key={video.id}
          />
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />

      <VideoPlayerModal
        locale={locale}
        onClose={() => setSelectedVideo(null)}
        onSelectRelated={async (videoId) => {
          try {
            const detail = await mediaContentService.videos.getById(videoId)
            setSelectedVideo(detail)
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Unable to open the selected video.'))
          }
        }}
        open={Boolean(selectedVideo)}
        video={selectedVideo}
      />
    </div>
  )
}

export default VideoGallery
