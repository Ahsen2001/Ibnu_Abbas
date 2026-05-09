import { ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { communicationService, type AcademicCalendarPayload, type AcademicCalendarRecord, type CalendarEventType } from '../../services/communicationService'
import { getApiErrorMessage } from '../../services/errorService'

type CalendarFormState = {
  id: number | null
  title: string
  description: string
  event_date: string
  end_date: string
  event_type: CalendarEventType
  department: 'shareea' | 'hifl' | ''
}

const eventTypeStyles: Record<CalendarEventType, string> = {
  holiday: 'bg-emerald-100 text-emerald-700',
  exam: 'bg-rose-100 text-rose-700',
  registration: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700',
}

const emptyEvent: CalendarFormState = {
  id: null,
  title: '',
  description: '',
  event_date: '',
  end_date: '',
  event_type: 'other',
  department: '',
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function AcademicCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [department, setDepartment] = useState<'shareea' | 'hifl' | ''>('')
  const [events, setEvents] = useState<AcademicCalendarRecord[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<AcademicCalendarRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [form, setForm] = useState<CalendarFormState>(emptyEvent)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadCalendar = async () => {
    try {
      const [eventResponse, upcomingResponse] = await Promise.all([
        communicationService.listCalendarEvents({
          month: currentMonth,
          department: department || undefined,
        }),
        communicationService.listUpcomingEvents({
          department: department || undefined,
        }),
      ])

      setEvents(eventResponse)
      setUpcomingEvents(upcomingResponse)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load academic calendar.'))
    }
  }

  useEffect(() => {
    loadCalendar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, department])

  const monthStart = useMemo(() => new Date(`${currentMonth}-01T00:00:00`), [currentMonth])
  const calendarDays = useMemo(() => {
    const start = new Date(monthStart)
    start.setDate(1 - monthStart.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      return day
    })
  }, [monthStart])

  const openModalForDate = (date: string) => {
    setSelectedDate(date)
    setForm({ ...emptyEvent, event_date: date })
    setIsModalOpen(true)
  }

  const eventsForDay = (date: Date) => {
    const iso = toLocalDateString(date)

    return events.filter((event) => {
      const start = event.event_date
      const end = event.end_date ?? event.event_date
      return iso >= start && iso <= end
    })
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="grid gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-college-green">Communication</p>
            <h1 className="mt-2 text-3xl font-bold text-college-ink">Academic Calendar</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Manage college events, holidays, exams, and registration periods on a shared academic calendar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary min-h-9 px-3" onClick={() => {
              const previous = new Date(`${currentMonth}-01T00:00:00`)
              previous.setMonth(previous.getMonth() - 1)
              setCurrentMonth(`${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`)
            }} type="button"><ChevronLeft size={16} /></button>
            <input className="form-input max-w-44" onChange={(event) => setCurrentMonth(event.target.value)} type="month" value={currentMonth} />
            <button className="btn-secondary min-h-9 px-3" onClick={() => {
              const next = new Date(`${currentMonth}-01T00:00:00`)
              next.setMonth(next.getMonth() + 1)
              setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
            }} type="button"><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select className="form-input max-w-52" onChange={(event) => setDepartment(event.target.value as 'shareea' | 'hifl' | '')} value={department}>
            <option value="">All departments</option>
            <option value="shareea">Shareea</option>
            <option value="hifl">Hifl</option>
          </select>
        </div>

        <section className="panel overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div className="px-3 py-3" key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const iso = toLocalDateString(day)
              const isCurrentMonth = day.getMonth() === monthStart.getMonth()
              const dayEvents = eventsForDay(day)

              return (
                <button
                  className={`min-h-36 border-b border-r border-slate-200 px-2 py-2 text-left align-top transition hover:bg-slate-50 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}
                  key={iso}
                  onClick={() => openModalForDate(iso)}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{day.getDate()}</span>
                    <PlusCircle size={14} />
                  </div>
                  <div className="mt-2 grid gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${eventTypeStyles[event.event_type]}`} key={event.id}>
                        {event.title}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <h2 className="text-lg font-semibold text-college-ink">Upcoming Events</h2>
        <div className="mt-4 grid gap-3">
          {upcomingEvents.length ? upcomingEvents.map((event) => (
            <article className="rounded-xl border border-slate-200 px-4 py-3" key={event.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-college-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{event.event_date}{event.end_date ? ` to ${event.end_date}` : ''}</p>
                </div>
                <span className={`status-chip ${eventTypeStyles[event.event_type]}`}>{event.event_type}</span>
              </div>
              {event.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p> : null}
            </article>
          )) : <p className="text-sm text-slate-500">No upcoming events in the next 30 days.</p>}
        </div>
      </section>

      {isModalOpen && selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-college-mist p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-college-green">Calendar Event</p>
                <h2 className="mt-2 text-2xl font-bold text-college-ink">{selectedDate}</h2>
              </div>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)} type="button">Close</button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)]">
              <section className="panel p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Events On This Date</h3>
                <div className="mt-3 grid gap-3">
                  {eventsForDay(new Date(`${selectedDate}T00:00:00`)).length ? eventsForDay(new Date(`${selectedDate}T00:00:00`)).map((event) => (
                    <button
                      className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:bg-slate-50"
                      key={event.id}
                      onClick={() => setForm({
                        id: event.id,
                        title: event.title,
                        description: event.description ?? '',
                        event_date: event.event_date,
                        end_date: event.end_date ?? '',
                        event_type: event.event_type,
                        department: event.department ?? '',
                      })}
                      type="button"
                    >
                      <p className="font-semibold text-college-ink">{event.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{event.event_type} {event.department ? `| ${event.department}` : ''}</p>
                    </button>
                  )) : <p className="text-sm text-slate-500">No events yet for this date.</p>}
                </div>
              </section>

              <section className="panel p-4">
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Title
                    <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} value={form.title} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Description
                    <textarea className="form-input min-h-24 py-3" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} value={form.description} />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Event Date
                      <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, event_date: event.target.value }))} type="date" value={form.event_date} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      End Date
                      <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, end_date: event.target.value }))} type="date" value={form.end_date} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Event Type
                      <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, event_type: event.target.value as CalendarEventType }))} value={form.event_type}>
                        <option value="holiday">Holiday</option>
                        <option value="exam">Exam</option>
                        <option value="registration">Registration</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Department
                      <select className="form-input" onChange={(event) => setForm((current) => ({ ...current, department: event.target.value as 'shareea' | 'hifl' | '' }))} value={form.department}>
                        <option value="">All departments</option>
                        <option value="shareea">Shareea</option>
                        <option value="hifl">Hifl</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  {form.id ? (
                    <button
                      className="btn-secondary text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        try {
                          await communicationService.deleteCalendarEvent(form.id as number)
                          toast.success('Calendar event deleted.')
                          setForm({ ...emptyEvent, event_date: selectedDate })
                          await loadCalendar()
                        } catch (error) {
                          toast.error(getApiErrorMessage(error, 'Unable to delete the event.'))
                        }
                      }}
                      type="button"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  ) : null}
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      const payload: AcademicCalendarPayload = {
                        title: form.title,
                        description: form.description,
                        event_date: form.event_date,
                        end_date: form.end_date || null,
                        event_type: form.event_type,
                        department: form.department,
                      }

                      try {
                        if (form.id) {
                          await communicationService.updateCalendarEvent(form.id, payload)
                          toast.success('Calendar event updated.')
                        } else {
                          await communicationService.createCalendarEvent(payload)
                          toast.success('Calendar event created.')
                        }

                        setForm({ ...emptyEvent, event_date: selectedDate })
                        await loadCalendar()
                      } catch (error) {
                        toast.error(getApiErrorMessage(error, 'Unable to save the calendar event.'))
                      }
                    }}
                    type="button"
                  >
                    {form.id ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default AcademicCalendar
