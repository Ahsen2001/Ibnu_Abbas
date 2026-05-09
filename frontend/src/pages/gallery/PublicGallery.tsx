import { CalendarDays, Images, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import MediaCard from '../../components/MediaCard'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type GalleryAlbumRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'

const categoryOptions = [
  { label: 'All Albums', value: '' },
  { label: 'Events', value: 'event' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Academic', value: 'academic' },
  { label: 'Construction', value: 'construction' },
  { label: 'General', value: 'general' },
]

function PublicGallery() {
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [albums, setAlbums] = useState<GalleryAlbumRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.gallery
      .listAlbums({
        category: filters.category || undefined,
        search: filters.search || undefined,
        page: filters.page,
        per_page: 12,
      })
      .then((response) => {
        setAlbums(response.data)
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.total,
        })
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load the gallery right now.')))
      .finally(() => setIsLoading(false))
  }, [filters])

  const headingText = useMemo(
    () => ({
      title: 'Photo Gallery',
      description: 'Browse college life through event photography, academic milestones, and campus development memories.',
    }),
    [],
  )

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Media & Memories</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">{headingText.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{headingText.description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} published albums available
        </div>
      </section>

      <div className="grid gap-4">
        <SearchBar
          initialValue={filters.search}
          onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
          placeholder="Search albums by title or description"
        />
        <CategoryFilter categories={categoryOptions} onChange={(category) => setFilters((current) => ({ ...current, category, page: 1 }))} value={filters.category} />
      </div>

      {isLoading && albums.length === 0 ? (
        <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="mb-5 break-inside-avoid" key={`gallery-skeleton-${index}`}>
              <Skeleton className="aspect-[4/5] w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && albums.length === 0 ? (
        <div className="panel p-10 text-center">
          <Search className="mx-auto text-slate-300" size={28} />
          <h2 className="mt-4 text-xl font-semibold text-college-ink">No albums matched your filters</h2>
          <p className="mt-2 text-sm text-slate-500">Try a broader search or switch back to all categories.</p>
        </div>
      ) : null}

      <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
        {albums.map((album) => (
          <div className="mb-5 break-inside-avoid" key={album.id}>
            <MediaCard
              badge={<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-college-ink">{album.category}</span>}
              imageUrl={album.cover_image_url}
              meta={(
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDateTime(album.event_date, 'Date not recorded')}</span>
                  <span className="inline-flex items-center gap-1"><Images size={13} /> {album.images_count} images</span>
                </div>
              )}
              overlay={<div className="absolute inset-x-0 bottom-0 p-4 text-sm text-white">{getLocalizedText(album.description, locale, 'Open this album to explore the full gallery collection.')}</div>}
              subtitle={getLocalizedText(album.description, locale, 'A published gallery collection from the college.')}
              title={getLocalizedText(album.title, locale)}
              to={`/gallery/albums/${album.id}`}
            />
          </div>
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
    </div>
  )
}

export default PublicGallery
