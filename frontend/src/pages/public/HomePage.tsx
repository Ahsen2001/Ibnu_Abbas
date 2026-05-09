import { BookOpen, GraduationCap, Megaphone, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Skeleton from '../../components/Skeleton'
import { communicationService, type AnnouncementRecord } from '../../services/communicationService'

function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    communicationService
      .listPublicAnnouncements({ per_page: 3 })
      .then((response) => setAnnouncements(response.data))
      .catch(() => setAnnouncements([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-college-green">Admissions and academic management</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-college-ink sm:text-5xl">
            IBNU ABBAS ARABIC COLLEGE
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A focused management system for admissions, Shareea education, Hifl tracking, students, teachers,
            announcements, and reporting.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">
              <Send size={18} />
              Apply Now
            </Link>
            <Link className="btn-secondary" to="/login">Portal Login</Link>
          </div>
        </div>
        <div className="grid gap-4">
          <article className="panel p-5">
            <BookOpen className="mb-4 text-college-green" size={28} />
            <h2 className="text-lg font-bold text-college-ink">Shareea Education</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Subjects, exams, grades, and academic progression.</p>
          </article>
          <article className="panel p-5">
            <GraduationCap className="mb-4 text-college-gold" size={28} />
            <h2 className="text-lg font-bold text-college-ink">Hifl Program</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Daily sabaq, revision logs, and completion tracking.</p>
          </article>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">College Updates</p>
            <h2 className="text-2xl font-bold text-college-ink">Published Announcements</h2>
          </div>
          <p className="text-sm text-slate-500">Latest public notices from the college administration.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <article className="panel p-5" key={`home-announcement-skeleton-${index}`}>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-32" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </article>
            ))
          ) : null}

          {!isLoading && announcements.length === 0 ? (
            <article className="panel p-5 md:col-span-2 xl:col-span-3">
              <p className="text-sm text-slate-500">No public announcements are available right now.</p>
            </article>
          ) : null}

          {announcements.map((announcement) => (
            <article className="panel p-5" key={announcement.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-college-ink">{announcement.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : 'College Notice'}
                  </p>
                </div>
                <Megaphone className="text-college-green" size={18} />
              </div>
              <div className="mt-4 text-sm leading-6 text-slate-600" dangerouslySetInnerHTML={{ __html: announcement.body }} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
