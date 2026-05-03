import type { ApplicationStatus } from '../services/applicationService'
import StatusBadge from './StatusBadge'

const timelineOrder: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'interview_scheduled',
  'offered',
  'accepted',
]

type TimelineTrackerProps = {
  status: ApplicationStatus
}

function TimelineTracker({ status }: TimelineTrackerProps) {
  const activeIndex = timelineOrder.indexOf(status)
  const isTerminal = status === 'rejected' || status === 'withdrawn'

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-college-ink">Application Timeline</h3>
        <StatusBadge status={status} />
      </div>
      <div className="grid gap-4">
        {timelineOrder.map((item, index) => {
          const complete = !isTerminal && index <= activeIndex

          return (
            <div className="flex gap-3" key={item}>
              <div className="grid justify-items-center">
                <div className={`h-4 w-4 rounded-full ${complete ? 'bg-college-green' : 'bg-slate-300'}`} />
                {index < timelineOrder.length - 1 ? <div className={`mt-1 h-full w-0.5 ${complete ? 'bg-college-green' : 'bg-slate-200'}`} /> : null}
              </div>
              <div className="pb-3">
                <p className={`text-sm font-semibold ${complete ? 'text-college-ink' : 'text-slate-500'}`}>{item.replaceAll('_', ' ')}</p>
              </div>
            </div>
          )
        })}
        {isTerminal ? <p className="text-sm text-slate-600">This application was marked as {status.replaceAll('_', ' ')}.</p> : null}
      </div>
    </div>
  )
}

export default TimelineTracker
