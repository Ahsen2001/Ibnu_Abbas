import type { ReactNode } from 'react'

type FilterPanelProps = {
  title?: string
  onClear?: () => void
  children: ReactNode
}

function FilterPanel({ title = 'Filters', onClear, children }: FilterPanelProps) {
  return (
    <section className="panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-college-ink">{title}</h2>
          <p className="text-xs text-slate-500">Refine the list using one or more filters.</p>
        </div>
        {onClear ? (
          <button className="btn-secondary min-h-9 px-3" onClick={onClear} type="button">
            Clear
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  )
}

export default FilterPanel
