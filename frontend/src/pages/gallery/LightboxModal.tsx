import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GalleryImageRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { getLocalizedText, isRtlLocale, type ContentLocale } from '../../utils/localizedContent'

type LightboxModalProps = {
  images: GalleryImageRecord[]
  initialIndex: number
  locale: ContentLocale
  open: boolean
  onClose: () => void
}

function LightboxModal({ images, initialIndex, locale, open, onClose }: LightboxModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const touchStartRef = useRef<number | null>(null)
  const isRtl = isRtlLocale(locale)

  useEffect(() => {
    if (!open) {
      return
    }

    setActiveIndex(initialIndex)
  }, [initialIndex, open])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [images.length, onClose, open])

  const activeImage = useMemo(() => images[activeIndex] ?? null, [activeIndex, images])

  if (!open || !activeImage) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex bg-slate-950/95" role="dialog">
      <button
        aria-label="Close lightbox"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <X size={20} />
      </button>

      <button
        aria-label="Previous image"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
        onClick={() => setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))}
        type="button"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        aria-label="Next image"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
        onClick={() => setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))}
        type="button"
      >
        <ChevronRight size={20} />
      </button>

      <div
        className="flex min-h-screen w-full flex-col items-center justify-center gap-5 px-4 py-8"
        onTouchEnd={(event) => {
          if (touchStartRef.current === null) {
            return
          }

          const distance = event.changedTouches[0].clientX - touchStartRef.current
          touchStartRef.current = null

          if (distance > 50) {
            setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
          } else if (distance < -50) {
            setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))
          }
        }}
        onTouchStart={(event) => {
          touchStartRef.current = event.touches[0].clientX
        }}
      >
        <img
          alt={getLocalizedText(activeImage.caption, locale, 'Gallery image')}
          className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
          src={activeImage.image_url}
        />

        <div className="flex w-full max-w-4xl flex-col gap-3 rounded-2xl bg-white/10 p-4 text-white backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/80">
              {activeIndex + 1}/{images.length}
            </p>
            <p className="mt-1 text-base leading-7" dir={isRtl ? 'rtl' : 'ltr'}>
              {getLocalizedText(activeImage.caption, locale, 'No caption provided for this image.')}
            </p>
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-college-ink transition hover:bg-slate-100"
            onClick={() => triggerDownload(activeImage.download_url)}
            type="button"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default LightboxModal
