import { UploadCloud, X } from 'lucide-react'
import { useRef } from 'react'
import toast from 'react-hot-toast'

type FileUploadProps = {
  files: File[]
  existingFiles?: string[]
  progress: number
  onChange: (files: File[]) => void
  onRemoveExisting?: (path: string) => void
}

function FileUpload({ files, existingFiles = [], progress, onChange, onRemoveExisting }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const maxDocumentBytes = 8 * 1024 * 1024

  const handleFileSelect = (selectedList: FileList | null) => {
    const selectedFiles = Array.from(selectedList ?? [])
    if (selectedFiles.length === 0) return

    const oversized = selectedFiles.find((file) => file.size > maxDocumentBytes)

    if (oversized) {
      toast.error(`${oversized.name} is larger than 8 MB.`)
      return
    }

    onChange([...files, ...selectedFiles])
  }

  return (
    <div className="grid gap-4">
      <button
        className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-college-green hover:bg-teal-50"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <UploadCloud className="mb-3 text-college-green" size={30} />
        <span className="text-sm font-semibold text-college-ink">Upload supporting documents</span>
        <span className="mt-1 text-sm text-slate-500">Birth certificate, school certificate, and passport-style photo.</span>
      </button>

      <input
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        multiple
        onChange={(event) => handleFileSelect(event.target.files)}
        ref={inputRef}
        type="file"
      />

      {(files.length > 0 || existingFiles.length > 0) && (
        <div className="grid gap-3">
          {existingFiles.map((path) => (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm" key={path}>
              <span className="truncate text-slate-600">{path.split('/').pop()}</span>
              {onRemoveExisting ? (
                <button className="text-slate-400 transition hover:text-red-600" onClick={() => onRemoveExisting(path)} type="button">
                  <X size={16} />
                </button>
              ) : null}
            </div>
          ))}
          {files.map((file, index) => (
            <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600" key={`${file.name}-${index}`}>
              {file.name}
            </div>
          ))}
        </div>
      )}

      {progress > 0 ? (
        <div className="grid gap-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-college-green transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-500">Upload progress {progress}%</span>
        </div>
      ) : null}
    </div>
  )
}

export default FileUpload
