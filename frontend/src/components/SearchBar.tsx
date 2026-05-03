import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type SearchBarProps = {
  initialValue?: string
  placeholder?: string
  onSearch: (value: string) => void
}

function SearchBar({ initialValue = '', placeholder = 'Search', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const submit = () => onSearch(value.trim())

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
      <Search className="text-slate-400" size={18} />
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        value={value}
      />
      {value ? (
        <button
          className="text-slate-400 transition hover:text-slate-600"
          onClick={() => {
            setValue('')
            onSearch('')
          }}
          type="button"
        >
          <X size={16} />
        </button>
      ) : null}
      <button className="btn-primary min-h-9 px-3" onClick={submit} type="button">
        Search
      </button>
    </div>
  )
}

export default SearchBar
