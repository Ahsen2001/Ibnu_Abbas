import { useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import type { AdmissionApplication } from '../../services/applicationService'
import { applicationService } from '../../services/applicationService'
import { getApiErrorMessage } from '../../services/errorService'

type InterviewSchedulerProps = {
  application: AdmissionApplication
  onSaved: (application: AdmissionApplication) => void
}

function InterviewScheduler({ application, onSaved }: InterviewSchedulerProps) {
  const [date, setDate] = useState(application.interview_date ?? '')
  const [time, setTime] = useState(application.interview_time ?? '')
  const [notes, setNotes] = useState(application.interview_notes ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const updated = await applicationService.scheduleInterview(application.id, {
        interview_date: date,
        interview_time: time,
        interview_notes: notes,
      })
      toast.success('Interview scheduled successfully')
      onSaved(updated)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to schedule interview.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Interview date
          <input className="form-input" onChange={(event) => setDate(event.target.value)} required type="date" value={date} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Interview time
          <input className="form-input" onChange={(event) => setTime(event.target.value)} required type="time" value={time} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Notes
        <textarea
          className="form-input min-h-28 py-3"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add interviewer notes or special instructions"
          value={notes}
        />
      </label>
      <div className="flex justify-end">
        <button className="btn-primary" disabled={isSaving} type="submit">
          {isSaving ? 'Saving...' : 'Save Interview Schedule'}
        </button>
      </div>
    </form>
  )
}

export default InterviewScheduler
