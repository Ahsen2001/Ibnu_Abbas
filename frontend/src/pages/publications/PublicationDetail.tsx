import { ArrowLeft, CalendarDays, Download, Hash, Layers3, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type PublicationRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'

function PublicationDetail() {
  const { publicationId } = useParams()
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [publication, setPublication] = useState<PublicationRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreparingDownload, setIsPreparingDownload] = useState(false)

  useEffect(() => {
    if (!publicationId) {
      return
    }

    setIsLoading(true)
    mediaContentService.publications
      .getById(Number(publicationId))
      .then(setPublication)
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load this publication.')))
      .finally(() => setIsLoading(false))
  }, [publicationId])

  const relatedPublications = useMemo(() => publication?.related_publications ?? [], [publication])

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-bold text-college-ink">Publication unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">This publication could not be loaded or is not published for public access.</p>
          <Link className="btn-primary mt-5 inline-flex" to="/publications">
            Return to library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <Link className="btn-secondary w-fit" to="/publications">
        <ArrowLeft size={16} />
        Back to publications
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)]">
        <section className="panel p-5">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {publication.cover_image_url ? (
                <img alt={getLocalizedText(publication.title, locale)} className="h-full w-full object-cover" src={publication.cover_image_url} />
              ) : (
                <div className="flex h-full min-h-80 items-center justify-center text-sm text-slate-400">No cover image</div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">{publication.category.replace('_', ' ')}</p>
              <h1 className="mt-3 text-3xl font-bold text-college-ink">{getLocalizedText(publication.title, locale)}</h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {getLocalizedText(publication.description, locale, 'This publication has no description yet.')}
              </p>

              <dl className="mt-6 grid gap-3 text-sm text-slate-600">
                <div className="flex flex-wrap gap-2">
                  <dt className="inline-flex items-center gap-2 font-semibold text-college-ink"><CalendarDays size={15} /> Published</dt>
                  <dd>{formatDateTime(publication.published_date, String(publication.published_year))}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="inline-flex items-center gap-2 font-semibold text-college-ink"><UserRound size={15} /> Author / Editor</dt>
                  <dd>{publication.author_editor || 'College editorial team'}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="inline-flex items-center gap-2 font-semibold text-college-ink"><Layers3 size={15} /> Department</dt>
                  <dd>{publication.department ? publication.department.toUpperCase() : 'All departments'}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="inline-flex items-center gap-2 font-semibold text-college-ink"><Hash size={15} /> Issue</dt>
                  <dd>{publication.issue_number || 'Not specified'}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="btn-primary"
                  disabled={isPreparingDownload}
                  onClick={async () => {
                    try {
                      setIsPreparingDownload(true)
                      const prepared = await mediaContentService.publications.prepareDownload(publication.id)
                      setPublication((current) => (current ? { ...current, download_count: prepared.download_count, preview_url: prepared.preview_url, download_url: prepared.download_url } : current))
                      triggerDownload(prepared.download_url)
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Unable to prepare the publication download.'))
                    } finally {
                      setIsPreparingDownload(false)
                    }
                  }}
                  type="button"
                >
                  <Download size={16} />
                  {isPreparingDownload ? 'Preparing...' : 'Download PDF'}
                </button>
                <span className="inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-600">
                  {publication.download_count} downloads
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {publication.preview_url ? (
              <iframe className="h-[70vh] w-full" src={publication.preview_url} title={getLocalizedText(publication.title, locale)} />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-slate-500">PDF preview is not available for this publication.</div>
            )}
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-college-ink">Related Publications</h2>
            <div className="mt-4 grid gap-3">
              {relatedPublications.length === 0 ? <p className="text-sm text-slate-500">No related publications available yet.</p> : null}
              {relatedPublications.map((item) => (
                <Link className="rounded-2xl border border-slate-200 p-3 transition hover:border-college-green hover:bg-teal-50/50" key={item.id} to={`/publications/${item.id}`}>
                  <p className="font-semibold text-college-ink">{getLocalizedText(item.title, locale)}</p>
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

export default PublicationDetail
