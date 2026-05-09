import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type MediaCardProps = {
  imageUrl?: string | null
  title: string
  subtitle?: string
  badge?: ReactNode
  meta?: ReactNode
  overlay?: ReactNode
  to?: string
  onClick?: () => void
  actions?: ReactNode
}

function MediaCard({ imageUrl, title, subtitle, badge, meta, overlay, to, onClick, actions }: MediaCardProps) {
  const content = (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl ? <img alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={imageUrl} /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No media</div>}
        {badge ? <div className="absolute left-3 top-3">{badge}</div> : null}
        {overlay ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent opacity-0 transition group-hover:opacity-100">{overlay}</div> : null}
      </div>
      <div className="grid gap-2 p-4">
        <h3 className="text-lg font-semibold text-college-ink">{title}</h3>
        {subtitle ? <p className="text-sm leading-6 text-slate-600">{subtitle}</p> : null}
        {meta ? <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{meta}</div> : null}
        {actions ? <div className="pt-2">{actions}</div> : null}
      </div>
    </article>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  if (onClick) {
    return <button className="w-full text-left" onClick={onClick} type="button">{content}</button>
  }

  return content
}

export default MediaCard
