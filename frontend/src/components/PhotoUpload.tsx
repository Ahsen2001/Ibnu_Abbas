import { Camera, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { studentService } from '../services/studentService'

type PhotoUploadProps = {
  file: File | null
  existingPath?: string | null
  onChange: (file: File | null) => void
  onRemoveExisting?: () => void
}

function PhotoUpload({ file, existingPath, onChange, onRemoveExisting }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const maxPhotoBytes = 10 * 1024 * 1024

  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }

    return existingPath ? studentService.getFileUrl(existingPath) : ''
  }, [existingPath, file])

  useEffect(() => {
    if (!file || !previewUrl.startsWith('blob:')) {
      return
    }

    return () => URL.revokeObjectURL(previewUrl)
  }, [file, previewUrl])

  return (
    <div className="grid gap-4">
      <button
        className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-college-green hover:bg-teal-50"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {previewUrl ? (
          <img alt="Student preview" className="mb-3 h-24 w-24 rounded-full object-cover" src={previewUrl} />
        ) : (
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <Camera size={28} />
          </div>
        )}
        <span className="text-sm font-semibold text-college-ink">Upload student photo</span>
        <span className="mt-1 text-sm text-slate-500">Use a clear passport-style image. JPG, PNG, or WEBP works best.</span>
      </button>

      <input
        accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.avif,.heic,.heif,image/*"
        className="hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null

          if (nextFile && nextFile.size > maxPhotoBytes) {
            toast.error('Photo must be 10 MB or smaller.')
            event.target.value = ''
            return
          }

          onChange(nextFile)
        }}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary min-h-9 px-3" onClick={() => inputRef.current?.click()} type="button">
          <UploadCloud size={16} />
          Choose Photo
        </button>
        {file || existingPath ? (
          <button
            className="btn-secondary min-h-9 px-3 text-red-600 hover:bg-red-50"
            onClick={() => {
              onChange(null)
              onRemoveExisting?.()
            }}
            type="button"
          >
            <Trash2 size={16} />
            Remove
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default PhotoUpload
