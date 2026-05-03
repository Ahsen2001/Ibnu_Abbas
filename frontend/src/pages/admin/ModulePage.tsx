type ModulePageProps = {
  title: string
  description: string
}

function ModulePage({ title, description }: ModulePageProps) {
  return (
    <section className="panel p-6">
      <p className="text-xs font-bold uppercase text-college-green">Management Module</p>
      <h2 className="mt-2 text-2xl font-bold text-college-ink">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500">
          <span>Name</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        <div className="grid grid-cols-3 px-4 py-4 text-sm text-slate-600">
          <span>API-ready workspace</span>
          <span>Active</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  )
}

export default ModulePage
