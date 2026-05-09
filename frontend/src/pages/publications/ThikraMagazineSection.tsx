import { BookMarked, Download, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import MediaCard from '../../components/MediaCard'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type PublicationRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'

function ThikraMagazineSection() {
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [issues, setIssues] = useState<PublicationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.publications
      .list({
        category: 'thikra_magazine',
        per_page: 24,
      })
      .then((response) => setIssues(response.data.sort((left, right) => right.published_year - left.published_year)))
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load Thikra magazine issues.')))
      .finally(() => setIsLoading(false))
  }, [])

  const latestIssue = useMemo(() => issues[0] ?? null, [issues])
  const archive = useMemo(() => issues.slice(1), [issues])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Publication Spotlight</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">Thikra Magazine</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Follow the latest issue first, then browse the archive of past Thikra magazine editions.
          </p>
        </div>
        <Link className="btn-secondary" to="/publications">
          Back to Publication Library
        </Link>
      </section>

      {isLoading ? <Skeleton className="h-[28rem] w-full" /> : null}

      {!isLoading && latestIssue ? (
        <section className="panel overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="bg-slate-100">
              {latestIssue.cover_image_url ? <img alt={getLocalizedText(latestIssue.title, locale)} className="h-full w-full object-cover" src={latestIssue.cover_image_url} /> : null}
            </div>
            <div className="flex flex-col justify-between p-6">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-college-green">
                  <Sparkles size={14} />
                  Latest Issue
                </p>
                <h2 className="mt-4 text-3xl font-bold text-college-ink">{getLocalizedText(latestIssue.title, locale)}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {getLocalizedText(latestIssue.description, locale, 'Read the latest edition of Thikra magazine.')}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Year {latestIssue.published_year}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Issue {latestIssue.issue_number || 'Current'}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="btn-primary" to={`/publications/${latestIssue.id}`}>Open Issue</Link>
                <button className="btn-secondary" onClick={() => triggerDownload(latestIssue.download_url)} type="button">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {!isLoading ? (
        <section className="grid gap-5">
          <div className="flex items-center gap-2">
            <BookMarked className="text-college-green" size={20} />
            <h2 className="text-2xl font-bold text-college-ink">Archive</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {archive.length === 0 ? <div className="panel p-6 text-sm text-slate-500">No archived issues are available yet.</div> : null}
            {archive.map((issue) => (
              <MediaCard
                actions={<span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Year {issue.published_year}</span>}
                badge={<span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase text-college-ink">Issue {issue.issue_number || issue.published_year}</span>}
                imageUrl={issue.cover_image_url}
                subtitle={getLocalizedText(issue.description, locale, 'Open this issue to preview and download the magazine PDF.')}
                title={getLocalizedText(issue.title, locale)}
                key={issue.id}
                to={`/publications/${issue.id}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default ThikraMagazineSection
