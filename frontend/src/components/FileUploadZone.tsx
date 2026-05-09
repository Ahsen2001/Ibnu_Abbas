import { FileUp, X } from 'lucide-react'
import { useRef, useState } from 'react'

type FileUploadZoneProps = {
  label: string
  accept?: string
  multiple?: boolean
  files: File[]
  progress?: Record<string, number>
  onChange: (files: File[]) => void
  helperText?: string
  maxFiles?: number
}

function FileUploadZone({
  label,
  accept,
  multiple = false,
  files,
  progress = {},
  onChange,
  helperText,
  maxFiles,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const mergeFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const next = multiple ? [...files, ...Array.from(incoming)] : Array.from(incoming).slice(0, 1)
    onChange(typeof maxFiles === 'number' ? next.slice(0, maxFiles) : next)
  }

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-5 transition ${isDragging ? 'border-college-green bg-teal-50' : 'border-slate-300 bg-white'}`}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        mergeFiles(event.dataTransfer.files)
      }}
    >
      <input
        accept={accept}
        className="hidden"
        multiple={multiple}
        onChange={(event) => mergeFiles(event.target.files)}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-teal-50 p-4 text-college-green">
          <FileUp size={22} />
        </div>
        <div>
          <p className="font-semibold text-college-ink">{label}</p>
          {helperText ? <p className="mt-1 text-sm text-slate-500">{helperText}</p> : null}
        </div>
        <button className="btn-secondary" onClick={() => inputRef.current?.click()} type="button">
          Choose File{multiple ? 's' : ''}
        </button>
      </div>

      {files.length ? (
        <div className="mt-5 grid gap-3">
          {files.map((file) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" key={`${file.name}-${file.size}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-college-ink">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  className="text-slate-400 transition hover:text-slate-700"
                  onClick={() => onChange(files.filter((entry) => entry !== file))}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
              {progress[file.name] !== undefined ? (
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-college-green transition-all" style={{ width: `${progress[file.name]}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Uploading... {progress[file.name]}%</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default FileUploadZone
