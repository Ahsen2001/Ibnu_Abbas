type PublishToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  publishedLabel?: string
  draftLabel?: string
}

function PublishToggle({ checked, onChange, publishedLabel = 'Published', draftLabel = 'Draft' }: PublishToggleProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
        checked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${checked ? 'bg-emerald-600' : 'bg-slate-400'}`} />
      {checked ? publishedLabel : draftLabel}
    </button>
  )
}

export default PublishToggle
