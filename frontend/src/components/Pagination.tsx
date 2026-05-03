type PaginationProps = {
  currentPage: number
  lastPage: number
  total: number
  onChange: (page: number) => void
}

function Pagination({ currentPage, lastPage, total, onChange }: PaginationProps) {
  if (lastPage <= 1) {
    return null
  }

  const pages = Array.from({ length: lastPage }, (_, index) => index + 1).slice(
    Math.max(currentPage - 3, 0),
    Math.min(currentPage + 2, lastPage),
  )

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">Total records: {total}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-secondary min-h-9 px-3" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)} type="button">
          Previous
        </button>
        {pages.map((page) => (
          <button
            className={page === currentPage ? 'btn-primary min-h-9 px-3' : 'btn-secondary min-h-9 px-3'}
            key={page}
            onClick={() => onChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}
        <button className="btn-secondary min-h-9 px-3" disabled={currentPage === lastPage} onClick={() => onChange(currentPage + 1)} type="button">
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
