'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Focus,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

import { PageHeader, TaskflowShell } from '../taskflow-shell';
import {
  EmptyState,
  Field,
  FormShell,
  PageError,
  PageLoading,
  inputClass,
  selectClass,
} from '@/components/ui/page-kit';
import { useResource } from '@/hooks/use-resource';
import { cn } from '@/lib/utils';
import type {
  ICreateScheduleEventInput,
  IScheduleEvent,
  PagePreviewState,
  ScheduleEventType,
} from '@/lib/types';
import { schedules } from '@/lib/api/schedule';
import { QueryClient, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface SchedulePageProps{
  preview?: PagePreviewState;
}

type ScheduleFilter = 'Meeting' | 'Deadline' | 'Focus';

const TODAY = new Date().toISOString().split('T')[0];
const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 60;



const eventTone: Record<
  ScheduleEventType,
  { card: string; dot: string; label: string }
> = {
  Meeting: {
    card: 'border-[#d6e2ff] bg-[#edf3ff]',
    dot: 'bg-[#4e7cff]',
    label: 'text-[#4e7cff]',
  },
  Deadline: {
    card: 'border-[#ffd3d5] bg-[#fff0f0]',
    dot: 'bg-[#ff646b]',
    label: 'text-[#ff646b]',
  },
  Focus: {
    card: 'border-[#c9f0dc] bg-[#eafaf3]',
    dot: 'bg-[#25a66a]',
    label: 'text-[#25a66a]',
  },
};

const INITIAL_EVENTS: IScheduleEvent[] = [
  {
    id: 'event-2',
    user_id:1,
    title: 'Client check-in',
    description: 'Weekly sync with Northstar Studio',
    startTime: '13:00',
    endTime: '13:30',
    date: new Date('2026-10-19'),
    attendees: ['Amanuel Tadesse'],
    type: 'Meeting',
    location: 'Video call',
    created_at:"2026-10-19"
  },
  {
    id: 'event-3',
    title: 'Focus time',
    user_id:2,
    description: 'Deep work on the campaign analysis',
    startTime: '15:00',
    endTime: '17:00',
    date: new Date('2026-10-19'),
    attendees: [],
    type: 'Focus',
    location: 'Do not disturb',
  },
  {
    id: 'event-4',
    title: 'Q4 roadmap deadline',
    description: 'Submit the product roadmap to leadership',
    user_id:3,
    startTime: '09:00',
    endTime: '09:30',
    date: new Date('2026-10-20'),
    attendees: ['David Kim'],
    type: 'Deadline',
    location: 'Shared drive',
  },
  {
    id: 'event-5',
    title: 'Team standup',
    description: 'Daily sync',
    user_id:5,
    startTime: '09:00',
    endTime: '09:15',
    date: new Date('2026-10-21'),
    attendees: ['Maya Chen', 'Jon Bell', 'Priya Sharma'],
    type: 'Meeting',
    location: 'Video call',
  },
  {
    id: 'event-6',
    title: 'Invoice run',
    user_id:4,
    description: 'Send the monthly invoices to active clients',
    startTime: '11:00',
    endTime: '12:00',
    date: new Date('2026-10-22'),
    attendees: ['Aisha Patel'],
    type: 'Deadline',
    location: 'Finance',
  },
  {
    id: 'event-7',
    title: 'Client workshop',
    user_id:4,
    description: 'Discovery workshop with Brightline Labs',
    startTime: '14:00',
    endTime: '16:00',
    date: new Date('2026-10-23'),
    attendees: ['Maya Chen', 'Aisha Patel', 'Omar Hassan'],
    type: 'Meeting',
    location: 'Brightline HQ',
  },
]; 

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatDay(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', options);
}

interface SchedulePageProps {
  preview?: PagePreviewState;
}







export function SchedulePage({ preview }: SchedulePageProps) {
  const { status,  retry } = useResource({ preview }); 
  const queryClient = useQueryClient()
  const [events, setEvents] = useState<IScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSchedules, setEditSchedules] = useState<ICreateScheduleEventInput | null>(null);
  const [editForm, setEditForm] = useState({
    
    });
  const [toast, setToast] = useState<{
    type: "error" | "success" | "warning";
    message: string;
    title:string;
    
  } | null>(null)
  const [form, setForm] = useState<ICreateScheduleEventInput>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: new Date(),
    attendees: [],
    type: 'Meeting' as ScheduleEventType,
    location: '',
  });
  const [attendeeInput, setAttendeeInput] = useState('');

  const week = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(TODAY, index)),
    [],
  );
const rawList: IScheduleEvent[] = [];
  const isUsingDemo = rawList.length === 0 && preview !== 'empty';
  const ScheduleList: IScheduleEvent[] = isUsingDemo ? INITIAL_EVENTS : rawList;
 

  const dayEvents = useMemo(
    ()=> {
     return events.filter((event) => toISODate(event.date) === selectedDate).sort((a,b) => a.startTime.localeCompare(b.startTime)) 
    },
    [events],
  )

  const weekDeadlines = useMemo(
    ()=>
    events
    .filter((event) => event.type === 'Deadline' && toISODate(event.date) >= toISODate(new Date()))
    .sort((a, b) => toISODate(a.date).localeCompare(toISODate(b.date))),
    [events],
  )

 

  const focusHours = useMemo(() => {
    const minutes = dayEvents
      .filter((event) => event.type === 'Focus')
      .reduce(
        (total, event) =>
          total + (minutesFromTime(event.endTime) - minutesFromTime(event.startTime)),
        0,
      );
    return Math.round((minutes / 60) * 10) / 10;
  }, [dayEvents]);


   const counts = useMemo(
    ()=>({
      Meeting:ScheduleList.filter((schedules)=> schedules.type === 'Meeting').length,
      Deadline:ScheduleList.filter((schedules)=> schedules.type === 'Deadline').length,
      Focus: ScheduleList.filter((schedules)=> schedules.type === 'Focus').length
      
    }),
    [ScheduleList]
  )


  const scheduleQuery = useQuery({
    queryKey: ['schedules'],
    queryFn: async()=>{
      const response = await schedules.list();
      if (!response.success) throw new Error(response.message || "Failed to load")
      return response.data ?? []
    }
  })





  const meetingCount = dayEvents.filter((event) => event.type === 'Meeting').length;



    const createMutation = useMutation({
      mutationFn:(input:Parameters<typeof schedules.create>[0]) => schedules.create(input),
      onSuccess: ()=>{
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
        setIsAdding(false)
        setForm({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          date: new Date(),
          attendees: [],
          type: 'Meeting',
          location: '',
        })
        setAttendeeInput('');
        setToast({type: 'success', title: 'Contact created', message: 'New contact has been added to Audience.' })
      },
      
      onError:(error)=>{
       setError(error instanceof Error ? error.message : 'Failed to delete contact');
      }
    })

    const updateMutation = useMutation({
      mutationFn: ({id, input}: {id: string, input: Parameters<typeof schedules.update>[1]}) =>
      schedules.update(id, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
        setIsAdding(false)
        setForm({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          date: new Date(),
          attendees: [],
          type: 'Meeting',
          location: '',
        })
        setAttendeeInput('');
        setToast({type: 'success', title: 'Contact updated', message: 'Contact has been updated.' })
      },
      
      onError:(error)=>{
      setError(error instanceof Error ? error.message : 'Failed to delete contact');
      }
    })


    const deleteMutation = useMutation({
      mutationFn: (id: string) => schedules.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['schedules'] })
        setIsAdding(false)
        setForm({
          title: '',
          description: '',
          startTime: '09:00',
          endTime: '10:00',
          date: new Date(),
          attendees: [],
          type: 'Meeting',
          location: '',
        })
        setAttendeeInput('');
        setToast({type: 'success', title: 'Contact deleted', message: 'Contact has been deleted.' })
      },
      
      onError:(error)=>{
       setError(error instanceof Error ? error.message : 'Failed to delete contact');
      }
    })

   /*  const handleAddEvent = async(event: FormEvent<HTMLFormElement>)=>{
      event.preventDefault();
      setError(null);
      const title = form.title.trim() || "";
      if (!title){
        setError("Title is required")
        return;
      }
      createMutation.mutate({
        title,
        description: form.description.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        date: form.date,
        attendees: attendeeInput
        .split(",")
        .map((name)=> name.trim())
        .filter(Boolean),
        type: form.type,
        location: form.location?.trim() || undefined,
      })
    } */
    
     const handleAddEvent = (event: FormEvent<HTMLFormElement>)=>{
      event.preventDefault()
      setError(null)

const title = form.title.trim() || "";
      if (!title) {
        setError("Title is required")
        return;
      }
      if (!form.startTime || !form.endTime) {
        setError("Start and end time are required")
        return;
      }

      createMutation.mutate({
        title,
        description: form.description.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        date: form.date?.toISOString().split('T')[0] ?? '',
        attendees: attendeeInput
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean),
        type: form.type,
        location: form.location?.trim() || undefined,
      } as unknown as Parameters<typeof schedules.create>[0])
    } 

    /* const newEvent: IScheduleEvent = {
      id: `event-${Date.now()}`,
      title: form.title.trim(),
      
      description: form.description.trim(),
      start_time: form.start_time,
      end_time: form.end_time,
      date: form.date,
      attendees: attendeeInput
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
      type: form.type,
      location: form.location?.trim() || undefined,
    };

    setEvents((current) => [...current, newEvent]);
    setSelectedDate(form.date);
    setForm({
      title: '',
      description: '',
      start_time: '09:00',
      end_time: '10:00',
      date: new Date(),
      attendees: [],
      type: 'Meeting',
      location: '',
    });
    setAttendeeInput('');
    setIsAdding(false);
  }
 */
  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  
  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="PLANNING"
        title="Schedule"
        description="See meetings, deadlines, and focus time in one place."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Plus className="size-[18px]" />
            Add event
          </button>
        }
      />

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Add new event"
            description="Meetings, deadlines and focus blocks all live in the same timeline."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddEvent}
            submitLabel="Add event"
            isSubmitting={createMutation.isPending}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event title" htmlFor="event-title" className="sm:col-span-2">
                <input
                  id="event-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="e.g. Team standup"
                  className={inputClass}
                />
              </Field>
              <Field label="Description" htmlFor="event-description" className="sm:col-span-2">
                <input
                  id="event-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="What is this about?"
                  className={inputClass}
                />
              </Field>
              <Field label="Date" htmlFor="event-date">
                <input
                  id="event-date"
                  type="date"
                  value={form.date?.toISOString().split('T')[0]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: new Date(event.target.value) }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Type" htmlFor="event-type">
                <select
                  id="event-type"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as ScheduleEventType,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Meeting', 'Deadline', 'Focus'] as ScheduleEventType[]).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start time" htmlFor="event-start">
                <input
                  id="event-start"
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startTime: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="End time" htmlFor="event-end">
                <input
                  id="event-end"
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endTime: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Location" htmlFor="event-location">
                <input
                  id="event-location"
                  value={form.location ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, location: event.target.value }))
                  }
                  placeholder="Video call"
                  className={inputClass}
                />
              </Field>
              <Field label="Attendees" htmlFor="event-attendees" hint="Separate names with commas">
                <input
                  id="event-attendees"
                  value={attendeeInput}
                  onChange={(event) => setAttendeeInput(event.target.value)}
                  placeholder="Sarah Chen, Marcus Reed"
                  className={inputClass}
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">Week of October </h2>
            <p className="section-subtitle">Pick a day to open its timeline</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              aria-label="Previous day"
              className="soft-button"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button type="button" onClick={() => setSelectedDate(TODAY)} className="soft-button">
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              aria-label="Next day"
              className="soft-button"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {week.map((day) => {
            const count = events.filter((event) => toISODate(event.date) === day).length;
            const active = day === selectedDate;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(day)}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition',
                  active
                    ? 'border-[#ff646b] bg-[#fff0f0] text-[#ff646b]'
                    : 'border-[#edf0f5] bg-white text-[#566176] hover:border-[#ffb9bb]',
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  {formatDay(day, { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">{Number(day.slice(-2))}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    active ? 'bg-white text-[#ff646b]' : 'bg-[#f4f6f9] text-[#8b96a9]',
                  )}
                >
                  {count} {count === 1 ? 'event' : 'events'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel lg:col-span-2">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">
                {formatDay(selectedDate, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <p className="section-subtitle">
                {dayEvents.length} scheduled · {meetingCount} meetings · {focusHours}h focus
              </p>
            </div>
          </div>

          {status === 'loading' ? (
            <PageLoading label="Loading your calendar…" rows={3} />
          ) : status === 'error' ? (
            <PageError message={error ?? 'We could not load your calendar.'} onRetry={retry} />
          ) : dayEvents.length === 0 || preview === 'empty' ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="This day is wide open. Add a meeting, a deadline, or protect some focus time."
              action={
                <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                  <Plus className="size-3.5" /> Add event
                </button>
              }
            />
          ) : (
            <div className="flex gap-3">
              <div className="hidden w-14 shrink-0 flex-col sm:flex">
                {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                  <div
                    key={index}
                    className="flex h-[60px] items-start justify-end pr-1 text-[10px] font-medium text-[#aeb9cc]"
                  >
                    {`${String(START_HOUR + index).padStart(2, '0')}:00`}
                  </div>
                ))}
              </div>

              <div
                className="relative flex-1 border-l border-[#f4f6f9]"
                style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
              >
                {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                  <div
                    key={index}
                    className="absolute left-0 right-0 border-b border-[#f4f6f9]"
                    style={{ top: index * HOUR_HEIGHT }}
                  />
                ))}

                {dayEvents.map((event) => {
                  const start = minutesFromTime(event.startTime);
                  const duration = Math.max(
                    20,
                    minutesFromTime(event.endTime) - minutesFromTime(event.startTime),
                  );
                  const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = (duration / 60) * HOUR_HEIGHT - 6;
                  const tone = eventTone[event.type];

                  return (
                    <article
                      key={event.id}
                      className={cn(
                        'absolute left-2 right-2 overflow-hidden rounded-xl border p-3 shadow-sm transition hover:shadow-md',
                        tone.card,
                      )}
                      style={{ top: top + 3, height }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} />
                            <h3 className="truncate text-sm font-bold text-[#172033]">
                              {event.title}
                            </h3>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-[#566176]">
                            {event.description}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-[#7f8a9e]">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              {event.startTime} – {event.endTime}
                            </span>
                            {event.location ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" />
                                {event.location}
                              </span>
                            ) : null}
                            {event.attendees.length ? (
                              <span className="inline-flex items-center gap-1">
                                <Users className="size-3" />
                                {event.attendees.length}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className={cn('status-pill bg-white/70', tone.label)}>
                            {event.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              deleteMutation.mutate(String(event.id));
                              removeEvent(String(event.id));
                            }}
                            aria-label={`Remove ${event.title}`}
                            className="rounded-lg p-1 text-[#a3adbc] transition hover:bg-white hover:text-[#ff646b]"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2 className="section-title">Day summary</h2>
                <p className="section-subtitle">How the day is shaped</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-[#f8faff] p-3">
                <p className="text-lg font-bold text-[#172033]">{meetingCount}</p>
                <p className="text-[11px] text-[#8b96a9]">Meetings</p>
              </div>
              <div className="rounded-xl bg-[#f8faff] p-3">
                <p className="text-lg font-bold text-[#172033]">{focusHours}h</p>
                <p className="text-[11px] text-[#8b96a9]">Focus</p>
              </div>
              <div className="rounded-xl bg-[#f8faff] p-3">
                <p className="text-lg font-bold text-[#172033]">
                  {dayEvents.filter((event) => event.type === 'Deadline').length}
                </p>
                <p className="text-[11px] text-[#8b96a9]">Deadlines</p>
              </div>
            </div>

            {dayEvents.length ? (
              <ul className="mt-5 space-y-3">
                {dayEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-2 text-sm">
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', eventTone[event.type].dot)} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#172033]">{event.title}</p>
                      <p className="text-xs text-[#8b96a9]">
                        {event.startTime} – {event.endTime}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-[#8b96a9]">Nothing on the calendar today.</p>
            )}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2 className="section-title">Upcoming deadlines</h2>
                <p className="section-subtitle">Rest of this week</p>
              </div>
            </div>
            {weekDeadlines.length === 0 ? (
              <p className="text-sm text-[#8b96a9]">No deadlines left this week.</p>
            ) : (
              <ul className="space-y-3">
                {weekDeadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[#edf0f5] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#172033]">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-[#8b96a9]">
                        {formatDay(toISODate(deadline.date), { month: 'short', day: 'numeric' })} ·{' '}
                        {deadline.startTime}
                      </p>
                    </div>
                    <span className="status-pill status-red shrink-0">Deadline</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </TaskflowShell>
  );
}



export default SchedulePage;
