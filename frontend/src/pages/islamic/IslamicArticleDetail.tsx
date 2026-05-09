import { Copy, Tag, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import Skeleton from '../../components/Skeleton'
import ViewCountBadge from '../../components/ViewCountBadge'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type IslamicArticleRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, isRtlLocale, normalizeContentLocale, type ContentLocale } from '../../utils/localizedContent'

const languageOptions: { label: string; value: ContentLocale }[] = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Arabic', value: 'ar' },
]

function IslamicArticleDetail() {
  const { articleId } = useParams()
  const { user } = useAuth()
  const defaultLocale = normalizeContentLocale(user?.preferred_locale)
  const [contentLocale, setContentLocale] = useState<ContentLocale>(defaultLocale)
  const [article, setArticle] = useState<IslamicArticleRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!articleId) {
      return
    }

    setIsLoading(true)
    mediaContentService.articles
      .getById(Number(articleId))
      .then(setArticle)
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load this Islamic article.')))
      .finally(() => setIsLoading(false))
  }, [articleId])

  const relatedArticles = useMemo(() => article?.related_articles ?? [], [article])
  const isRtl = isRtlLocale(contentLocale)

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
        <Skeleton className="h-[28rem] w-full" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-bold text-college-ink">Article unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">This article could not be loaded or is not published for public viewing.</p>
          <Link className="btn-primary mt-5 inline-flex" to="/islamic/articles">
            Return to article list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="btn-secondary" to="/islamic/articles">Back to Articles</Link>
        <CategoryFilter categories={languageOptions} onChange={(value) => setContentLocale(value as ContentLocale)} value={contentLocale} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)]">
        <article className="panel overflow-hidden p-0">
          {article.cover_image_url ? (
            <div className="aspect-[16/6] overflow-hidden bg-slate-100">
              <img alt={getLocalizedText(article.title, contentLocale)} className="h-full w-full object-cover" src={article.cover_image_url} />
            </div>
          ) : null}
          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">{article.category.replace('_', ' ')}</p>
            <h1 className="mt-3 text-3xl font-bold text-college-ink">{getLocalizedText(article.title, contentLocale)}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><UserRound size={14} /> {article.author_name}</span>
              <span>{formatDateTime(article.published_at, 'Recently published')}</span>
              <ViewCountBadge count={article.views_count} />
            </div>
            {article.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={tag}>
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="prose prose-slate mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: getLocalizedText(article.content, contentLocale) }} dir={isRtl ? 'rtl' : 'ltr'} />
          </div>
        </article>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-college-ink">Share</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Copy a direct link to share this article with students, teachers, or families.</p>
            <button
              className="btn-secondary mt-4"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  toast.success('Article link copied.')
                } catch {
                  toast.error('Unable to copy the article link on this device.')
                }
              }}
              type="button"
            >
              <Copy size={16} />
              Copy Link
            </button>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-college-ink">Related Articles</h2>
            <div className="mt-4 grid gap-3">
              {relatedArticles.length === 0 ? <p className="text-sm text-slate-500">No related articles available yet.</p> : null}
              {relatedArticles.map((item) => (
                <Link className="rounded-2xl border border-slate-200 p-3 transition hover:border-college-green hover:bg-teal-50/50" key={item.id} to={`/islamic/articles/${item.id}`}>
                  <p className="font-semibold text-college-ink">{getLocalizedText(item.title, contentLocale)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.category.replace('_', ' ')}</p>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default IslamicArticleDetail
