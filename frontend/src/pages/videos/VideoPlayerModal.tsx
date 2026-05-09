import { ExternalLink, Eye, X } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { VideoRecord } from '../../services/mediaContentService'
import { triggerDownload } from '../../utils/download'
import { getLocalizedText, type ContentLocale } from '../../utils/localizedContent'

type VideoPlayerModalProps = {
  locale: ContentLocale
  open: boolean
  video: VideoRecord | null
  onClose: () => void
  onSelectRelated: (videoId: number) => void
}

function getYoutubeEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null
  }

  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

function VideoPlayerModal({ locale, onClose, onSelectRelated, open, video }: VideoPlayerModalProps) {
  const embedUrl = useMemo(() => getYoutubeEmbedUrl(video?.youtube_url), [video?.youtube_url])

  if (!open || !video) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl xl:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-college-green">{video.category}</p>
              <h2 className="mt-2 text-2xl font-bold text-college-ink">{getLocalizedText(video.title, locale)}</h2>
            </div>
            <button className="rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200" onClick={onClose} type="button">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            {video.media_type === 'youtube' && embedUrl ? (
              <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full" src={embedUrl} title={getLocalizedText(video.title, locale)} />
            ) : (
              <video className="aspect-video w-full" controls poster={video.thumbnail_url ?? undefined} src={video.media_url ?? undefined} />
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Eye size={14} />
              {video.views_count} views
            </span>
            <button className="btn-secondary" onClick={() => triggerDownload(video.media_download_url)} type="button">
              <ExternalLink size={16} />
              Open Media
            </button>
          </div>

          <div className="mt-5 text-sm leading-7 text-slate-600">
            {getLocalizedText(video.description, locale, 'No description was added for this video.')}
          </div>
        </div>

        <aside className="w-full border-t border-slate-200 bg-slate-50 xl:w-[320px] xl:border-l xl:border-t-0">
          <div className="p-5">
            <h3 className="text-lg font-semibold text-college-ink">Related Videos</h3>
            <div className="mt-4 grid gap-3">
              {video.related_videos?.length ? null : <p className="text-sm text-slate-500">No related videos available yet.</p>}
              {video.related_videos?.map((item) => (
                <button
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-college-green hover:bg-teal-50/50"
                  key={item.id}
                  onClick={() => onSelectRelated(item.id)}
                  type="button"
                >
                  <p className="font-semibold text-college-ink">{getLocalizedText(item.title, locale)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.category}</p>
                </button>
              ))}
            </div>
            <Link className="btn-secondary mt-5 w-full justify-center" to="/videos">
              Full Gallery
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default VideoPlayerModal
