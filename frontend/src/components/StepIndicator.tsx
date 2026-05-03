type StepIndicatorProps = {
  currentStep: number
  steps: string[]
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isComplete = stepNumber < currentStep

          return (
            <div className="flex min-w-0 flex-1 items-center gap-2" key={step}>
              <div
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition',
                  isComplete ? 'border-college-green bg-college-green text-white' : '',
                  isActive ? 'border-college-green bg-teal-50 text-college-green' : '',
                  !isActive && !isComplete ? 'border-slate-300 bg-white text-slate-500' : '',
                ].join(' ')}
              >
                {stepNumber}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isActive ? 'text-college-ink' : 'text-slate-500'}`}>{step}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className={`hidden h-0.5 flex-1 rounded-full md:block ${isComplete ? 'bg-college-green' : 'bg-slate-200'}`} />
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-college-green transition-all" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

export default StepIndicator
