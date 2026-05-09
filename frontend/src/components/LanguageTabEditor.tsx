import { useMemo, useState } from 'react'
import type { LocalizedText } from '../services/mediaContentService'

type LanguageTabEditorProps = {
  label: string
  value: LocalizedText
  onChange: (value: LocalizedText) => void
  multiline?: boolean
  rows?: number
}

const languageMeta = [
  { key: 'en', label: 'EN' },
  { key: 'ta', label: 'TA' },
  { key: 'si', label: 'SI' },
  { key: 'ar', label: 'AR' },
] as const

function LanguageTabEditor({ label, value, onChange, multiline = false, rows = 6 }: LanguageTabEditorProps) {
  const [activeLang, setActiveLang] = useState<(typeof languageMeta)[number]['key']>('en')
  const dir = activeLang === 'ar' ? 'rtl' : 'ltr'
  const sharedProps = useMemo(
    () => ({
      className: 'form-input py-3',
      dir,
      lang: activeLang,
      value: value[activeLang],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({
          ...value,
          [activeLang]: event.target.value,
        }),
    }),
    [activeLang, dir, onChange, value],
  )

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex flex-wrap gap-2">
          {languageMeta.map((language) => (
            <button
              className={language.key === activeLang ? 'btn-primary min-h-9 px-3' : 'btn-secondary min-h-9 px-3'}
              key={language.key}
              onClick={() => setActiveLang(language.key)}
              type="button"
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input {...sharedProps} />
      )}
    </div>
  )
}

export default LanguageTabEditor
