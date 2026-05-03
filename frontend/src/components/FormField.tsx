import type { InputHTMLAttributes, ReactNode } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  suffix?: ReactNode
}

function FormField({ label, error, hint, suffix, className = '', ...props }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="relative">
        <input
          {...props}
          className={[
            'form-input',
            suffix ? 'pr-12' : '',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : '',
            className,
          ].join(' ')}
        />
        {suffix ? <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">{suffix}</span> : null}
      </div>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export default FormField
