import { Eye } from 'lucide-react'

type ViewCountBadgeProps = {
  count: number
  label?: string
}

function ViewCountBadge({ count, label = 'views' }: ViewCountBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
      <Eye size={14} />
      {count} {label}
    </span>
  )
}

export default ViewCountBadge
