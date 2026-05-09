import { ArrowLeft, CalendarDays, Download, Images } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import CategoryFilter from '../../components/CategoryFilter'
import Skeleton from '../../components/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../services/errorService'
import { mediaContentService, type GalleryAlbumRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { formatDateTime } from '../../utils/date'
import { getLocalizedText, normalizeContentLocale } from '../../utils/localizedContent'
import LightboxModal from './LightboxModal'

function AlbumView() {
  const { albumId } = useParams()
  const { user } = useAuth()
  const locale = normalizeContentLocale(user?.preferred_locale)
  const [album, setAlbum] = useState<GalleryAlbumRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [language, setLanguage] = useState(locale)

  useEffect(() => {
    if (!albumId) {
      return
    }

    setIsLoading(true)
    mediaContentService.gallery
      .getAlbum(Number(albumId))
      .then(setAlbum)
      .catch((error) => toast.error(getApiErrorMessage(error, 'Unable to load this gallery album.')))
      .finally(() => setIsLoading(false))
  }, [albumId])

  const categories = useMemo(
    () => [
      { label: 'English', value: 'en' },
      { label: 'Tamil', value: 'ta' },
      { label: 'Sinhala', value: 'si' },
      { label: 'Arabic', value: 'ar' },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-72 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton className="aspect-square w-full" key={`album-view-skeleton-${index}`} />)}
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="panel p-8 text-center">
          <h1 className="text-2xl font-bold text-college-ink">Album not found</h1>
          <p className="mt-2 text-sm text-slate-600">This album is unavailable or still waiting to be published.</p>
          <Link className="btn-primary mt-5 inline-flex" to="/gallery">
            Return to gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="btn-secondary" to="/gallery">
          <ArrowLeft size={16} />
          Back to gallery
        </Link>
        <CategoryFilter categories={categories} onChange={(value) => setLanguage(value as typeof language)} value={language} />
      </div>

      <section className="panel overflow-hidden p-0">
        <div className="relative aspect-[16/6] min-h-[240px] overflow-hidden bg-slate-200">
          {album.cover_image_url ? (
            <img alt={getLocalizedText(album.title, language)} className="h-full w-full object-cover" src={album.cover_image_url} />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">{album.category.replace('_', ' ')}</p>
            <h1 className="mt-3 text-3xl font-bold">{getLocalizedText(album.title, language)}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">
              {getLocalizedText(album.description, language, 'A published gallery collection from IBNU ABBAS ARABIC COLLEGE.')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                {formatDateTime(album.event_date, 'Date not recorded')}
              </span>
              <span className="inline-flex items-center gap-2">
                <Images size={16} />
                {album.images.length} images
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {album.images.map((image, index) => (
          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={image.id}>
            <button className="block w-full text-left" onClick={() => setActiveIndex(index)} type="button">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img alt={getLocalizedText(image.caption, language, 'Gallery image')} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={image.thumbnail_url || image.image_url} />
              </div>
            </button>
            <div className="grid gap-3 p-4">
              <p className="min-h-14 text-sm leading-6 text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {getLocalizedText(image.caption, language, 'No caption for this image.')}
              </p>
              <div className="flex items-center justify-between gap-3">
                <button className="btn-secondary min-h-9 px-3" onClick={() => setActiveIndex(index)} type="button">View</button>
                <button className="btn-secondary min-h-9 px-3" onClick={() => triggerDownload(image.download_url)} type="button">
                  <Download size={15} />
                  Download
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <LightboxModal
        images={album.images}
        initialIndex={activeIndex ?? 0}
        locale={language}
        onClose={() => setActiveIndex(null)}
        open={activeIndex !== null}
      />
    </div>
  )
}

export default AlbumView
