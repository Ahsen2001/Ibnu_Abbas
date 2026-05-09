import { Clock3, Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { communicationService, type AnnouncementRecord } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

function AnnouncementFeed() {
  const { role } = useAuth()
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'college_wide' | 'department' | 'unread' | 'expired'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    communicationService
      .listAnnouncements({ per_page: 50 })
      .then((response) => setAnnouncements(response.data))
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load announcements.')))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      if (filter === 'unread') {
        return !announcement.is_read
      }

      if (filter === 'expired') {
        return Boolean(announcement.is_expired)
      }

      if (filter === 'college_wide') {
        return !announcement.department
      }

      if (filter === 'department') {
        return Boolean(announcement.department)
      }

      return true
    })
  }, [announcements, filter])

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-college-green">Communication</p>
          <h1 className="mt-2 text-3xl font-bold text-college-ink">{role === 'teacher' ? 'Teacher' : 'Student'} Announcement Feed</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Stay up to date with college notices, deadlines, academic alerts, and department-specific updates.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('all')} type="button">All</button>
          <button className={filter === 'college_wide' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('college_wide')} type="button">College-wide</button>
          <button className={filter === 'department' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('department')} type="button">Department</button>
          <button className={filter === 'unread' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('unread')} type="button">Unread</button>
          <button className={filter === 'expired' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('expired')} type="button">Expired</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? <p className="text-sm text-slate-500">Loading announcements...</p> : null}
        {!isLoading && filteredAnnouncements.length === 0 ? <p className="text-sm text-slate-500">No announcements available in this view.</p> : null}
        {filteredAnnouncements.map((announcement) => (
          <article
            className={`panel p-5 transition ${announcement.is_expired ? 'opacity-60 grayscale' : ''}`}
            key={announcement.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-college-ink">{announcement.title}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {announcement.target_audience} {announcement.department ? `| ${announcement.department}` : ''}
                </p>
              </div>
              {!announcement.is_read ? <span className="status-chip bg-teal-50 text-college-green">New</span> : null}
            </div>

            <div className="mt-4 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: announcement.body }} />

            <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Clock3 size={14} />
                {announcement.published_at ? new Date(announcement.published_at).toLocaleString() : 'Scheduled'}
              </span>
              {announcement.expires_at ? <span>Expires {new Date(announcement.expires_at).toLocaleString()}</span> : null}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                className="btn-secondary min-h-9 px-3"
                onClick={async () => {
                  try {
                    await communicationService.markAnnouncementRead(announcement.id)
                    setAnnouncements((current) => current.map((item) => (
                      item.id === announcement.id ? { ...item, is_read: true } : item
                    )))
                    toast.success('Announcement marked as read.')
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, 'Unable to mark announcement as read.'))
                  }
                }}
                type="button"
              >
                <Eye size={15} />
                Mark as Read
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default AnnouncementFeed
