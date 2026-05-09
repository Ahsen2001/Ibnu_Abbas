import { BookOpenText, CalendarDays, UserRound } from 'lucide-react'
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
import { mediaContentService, type IslamicArticleCategory, type IslamicArticleRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale, type ContentLocale } from '../../utils/localizedContent'

const categories: { label: string; value: '' | IslamicArticleCategory }[] = [
  { label: 'All', value: '' },
  { label: 'Fiqh', value: 'fiqh' },
  { label: 'Aqeedah', value: 'aqeedah' },
  { label: 'Seerah', value: 'seerah' },
  { label: 'Quran Tafsir', value: 'quran_tafsir' },
  { label: 'Hadith', value: 'hadith' },
  { label: 'General', value: 'general' },
  { label: 'Fatwa', value: 'fatwa' },
]

const languageOptions: { label: string; value: ContentLocale }[] = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Arabic', value: 'ar' },
]

function IslamicArticleList() {
  const { user } = useAuth()
  const defaultLocale = normalizeContentLocale(user?.preferred_locale)
  const [contentLocale, setContentLocale] = useState<ContentLocale>(defaultLocale)
  const [articles, setArticles] = useState<IslamicArticleRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '' as '' | IslamicArticleCategory,
    search: '',
    sort: 'newest',
    page: 1,
  })
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.articles
      .list({
        category: filters.category || undefined,
        search: filters.search || undefined,
        sort: filters.sort === 'most_viewed' ? 'most_viewed' : undefined,
        page: filters.page,
        per_page: 12,
      })
      .then((response) => {
        setArticles(response.data)
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.total,
        })
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load Islamic articles right now.')))
      .finally(() => setIsLoading(false))
  }, [filters])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Islamic Content</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">Islamic Articles</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Read reflections, guidance, and scholarship curated across fiqh, seerah, tafsir, and more.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} articles published
        </div>
      </section>

      <SearchBar
        initialValue={filters.search}
        onSearch={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        placeholder="Search by title or author"
      />

      <div className="grid gap-4">
        <CategoryFilter categories={categories} onChange={(value) => setFilters((current) => ({ ...current, category: value as '' | IslamicArticleCategory, page: 1 }))} value={filters.category} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CategoryFilter categories={languageOptions} onChange={(value) => setContentLocale(value as ContentLocale)} value={contentLocale} />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Sort
            <select className="form-input min-w-44" onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value, page: 1 }))} value={filters.sort}>
              <option value="newest">Newest first</option>
              <option value="most_viewed">Most viewed</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && articles.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="aspect-[4/5] w-full" key={`article-skeleton-${index}`} />)}
        </div>
      ) : null}

      {!isLoading && articles.length === 0 ? (
        <div className="panel p-10 text-center">
          <BookOpenText className="mx-auto text-slate-300" size={28} />
          <h2 className="mt-4 text-xl font-semibold text-college-ink">No articles found</h2>
          <p className="mt-2 text-sm text-slate-500">Try another category or change the search phrase.</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <MediaCard
            actions={(
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ViewCountBadge count={article.views_count} />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{article.category.replace('_', ' ')}</span>
              </div>
            )}
            badge={<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-college-ink">{article.category.replace('_', ' ')}</span>}
            imageUrl={article.cover_image_url}
            meta={(
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1"><UserRound size={13} /> {article.author_name}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDateTime(article.published_at, 'Recently updated')}</span>
              </div>
            )}
            subtitle={getLocalizedText(article.content, contentLocale, 'Open the article to read the full text.')}
            title={getLocalizedText(article.title, contentLocale)}
            key={article.id}
            to={`/islamic/articles/${article.id}`}
          />
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={(page) => setFilters((current) => ({ ...current, page }))} total={pagination.total} />
    </div>
  )
}

export default IslamicArticleList
