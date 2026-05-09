import { BookOpenText, Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import FilterPanel from '../../components/FilterPanel'
import MediaCard from '../../components/MediaCard'
import Pagination from '../../components/Pagination'
import SearchBar from '../../components/SearchBar'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type PublicationCategory, type PublicationRecord } from '../../services/mediaContentService'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'

const categoryOptions: { label: string; value: '' | PublicationCategory }[] = [
  { label: 'All', value: '' },
  { label: 'Thikra Magazine', value: 'thikra_magazine' },
  { label: 'Syllabus Book', value: 'syllabus_book' },
  { label: 'Souvenir', value: 'souvenir' },
  { label: 'General Knowledge', value: 'general_knowledge' },
  { label: 'Research Journal', value: 'research_journal' },
  { label: 'Newsletter', value: 'newsletter' },
]

function PublicationLibrary() {
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [publications, setPublications] = useState<PublicationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '' as '' | PublicationCategory,
    year: '',
    department: '',
    search: '',
    sort: 'newest',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.publications
      .list({
        category: filters.category || undefined,
        year: filters.year || undefined,
        department: filters.department || undefined,
        search: filters.search || undefined,
        sort: filters.sort === 'most_downloaded' ? 'most_downloaded' : undefined,
        page: filters.page,
        per_page: 12,
      })
      .then((response) => {
        setPublications(response.data)
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.total,
        })
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load publications right now.')))
      .finally(() => setIsLoading(false))
  }, [filters])

  const availableYears = useMemo(() => {
    const years = new Set(publications.map((publication) => publication.published_year))
    return Array.from(years).sort((left, right) => right - left)
  }, [publications])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Publications</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">Publication Library</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Explore magazines, syllabus books, journals, and newsletters prepared across the college.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} publications indexed
        </div>
      </section>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by title or author / editor"
      />

      <FilterPanel onClear={() => setFilters({ category: '', year: '', department: '', search: '', sort: 'newest', page: 1 })} title="Publication Filters">
        <div className="md:col-span-2">
          <CategoryFilter categories={categoryOptions} onChange={(category) => setFilters((current) => ({ ...current, category: category as '' | PublicationCategory, page: 1 }))} value={filters.category} />
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Year
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value, page: 1 }))} value={filters.year}>
            <option value="">All years</option>
            {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Sort by
          <select className="form-input" onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))} value={filters.sort}>
            <option value="newest">Newest first</option>
            <option value="most_downloaded">Most downloaded</option>
          </select>
        </label>
      </FilterPanel>

      {isLoading && publications.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="aspect-[4/5] w-full" key={`publication-skeleton-${index}`} />)}
        </div>
      ) : null}

      {!isLoading && publications.length === 0 ? (
        <div className="panel p-10 text-center">
          <BookOpenText className="mx-auto text-slate-300" size={28} />
          <h2 className="mt-4 text-xl font-semibold text-college-ink">No publications found</h2>
          <p className="mt-2 text-sm text-slate-500">Try another category or remove some filters to widen the library view.</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {publications.map((publication) => (
          <MediaCard
            actions={(
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{publication.published_year}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Download size={13} /> {publication.download_count}</span>
              </div>
            )}
            badge={<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-college-ink">{publication.category.replace('_', ' ')}</span>}
            imageUrl={publication.cover_image_url}
            meta={publication.author_editor ? `By ${publication.author_editor}` : 'College publication'}
            subtitle={getLocalizedText(publication.description, locale, 'Read the latest publication details and open its PDF preview.')}
            title={getLocalizedText(publication.title, locale)}
            key={publication.id}
            to={`/publications/${publication.id}`}
          />
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
    </div>
  )
}

export default PublicationLibrary
