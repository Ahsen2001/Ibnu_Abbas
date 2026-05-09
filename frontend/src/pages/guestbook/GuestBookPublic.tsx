import { Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import Skeleton from '../../components/Skeleton'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type GuestEntryRecord } from '../../services/mediaContentService'
import { formatDateTime } from '../../utils/date'

function GuestBookPublic() {
  const [entries, setEntries] = useState<GuestEntryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })

  useEffect(() => {
    setIsLoading(true)
    mediaContentService.guestbook
      .listPublic({ page, per_page: 9 })
      .then((response) => {
        setEntries(response.data)
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.total,
        })
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load the guest book right now.')))
      .finally(() => setIsLoading(false))
  }, [page])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">Community Voices</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink sm:text-4xl">Guest Book</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Messages and reflections from distinguished visitors, scholars, and supporters of the college.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          {pagination.total} published entries
        </div>
      </section>

      {isLoading && entries.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="h-80 w-full" key={`guestbook-skeleton-${index}`} />)}
        </div>
      ) : null}

      {!isLoading && entries.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-xl font-semibold text-college-ink">No guest entries published yet</h2>
          <p className="mt-2 text-sm text-slate-500">Once new dignitary messages are published, they will appear here.</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <article className="panel p-5" key={entry.id}>
            <div className="flex items-start gap-4">
              {entry.photo_url ? (
                <img alt={entry.guest_name} className="h-16 w-16 rounded-2xl object-cover" src={entry.photo_url} />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-college-green">
                  <Quote size={22} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-college-ink">{entry.guest_name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {[entry.designation, entry.organization, entry.country].filter(Boolean).join(' | ') || 'Guest visitor'}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDateTime(entry.visit_date, 'Visit date not recorded')}</p>
              </div>
            </div>

            <blockquote className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              "{entry.message}"
            </blockquote>
          </article>
        ))}
      </div>

      <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage} onChange={setPage} total={pagination.total} />
    </div>
  )
}

export default GuestBookPublic
