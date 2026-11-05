'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Filter,
  List,
  MapPin,
  Plus,
  Trash2,
  Users,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

interface SchedulePageProps {
  preview?: PagePreviewState;
}

type ViewMode = 'schedule' | 'day' | 'week';
type FilterType = 'All' | ScheduleEventType;

// Setup constants
const NOW = new Date();
const TODAY = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}-${String(NOW.getDate()).padStart(2, '0')}`;
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 68;

/** Theme styling matching Google Calendar & Apple/iOS Calendar aesthetic */
const eventTheme: Record<
  ScheduleEventType,
  {
    accent: string;
    cardBg: string;
    border: string;
    borderLeft: string;
    text: string;
    dot: string;
    badge: string;
    avatarBg: string;
    avatarText: string;
  }
> = {
  Meeting: {
    accent: '#2563eb',
    cardBg: 'bg-[#f0f6ff]',
    border: 'border-[#dbeafe]',
    borderLeft: 'border-l-[#2563eb]',
    text: 'text-[#1e3a8a]',
    dot: 'bg-[#2563eb]',
    badge: 'bg-[#dbeafe] text-[#1e40af]',
    avatarBg: 'bg-[#dbeafe]',
    avatarText: 'text-[#1e40af]',
  },
  Deadline: {
    accent: '#ef4444',
    cardBg: 'bg-[#fef2f2]',
    border: 'border-[#fee2e2]',
    borderLeft: 'border-l-[#ef4444]',
    text: 'text-[#991b1b]',
    dot: 'bg-[#ef4444]',
    badge: 'bg-[#fee2e2] text-[#991b1b]',
    avatarBg: 'bg-[#fee2e2]',
    avatarText: 'text-[#991b1b]',
  },
  Focus: {
    accent: '#10b981',
    cardBg: 'bg-[#ecfdf5]',
    border: 'border-[#d1fae5]',
    borderLeft: 'border-l-[#10b981]',
    text: 'text-[#065f46]',
    dot: 'bg-[#10b981]',
    badge: 'bg-[#d1fae5] text-[#065f46]',
    avatarBg: 'bg-[#d1fae5]',
    avatarText: 'text-[#065f46]',
  },
};

/** Helpers */
function toISODate(date: Date | string | undefined | null): string {
  if (!date) return TODAY;
  if (typeof date === 'string') {
    if (date.length >= 10 && date.includes('-')) {
      return date.slice(0, 10);
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return TODAY;
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day; // Align to Monday
  date.setDate(date.getDate() + diff);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const dayNum = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${dayNum}`;
}

function normalizeTime(time: string | undefined | null): string {
  if (!time) return '09:00';
  if (time.includes('T')) {
    return time.split('T')[1].slice(0, 5);
  }
  if (time.includes(' ')) {
    return time.split(' ')[1].slice(0, 5);
  }
  return time.slice(0, 5);
}

function minutesFromTime(time: string): number {
  const norm = normalizeTime(time);
  const [hours, minutes] = norm.split(':').map(Number);
  return (isNaN(hours) ? 9 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

/** Formats 24h string (e.g. 13:30) to 12h Google/Apple style (1:30 PM) */
function formatTime12h(timeStr: string): string {
  const norm = normalizeTime(timeStr);
  const [hStr, mStr] = norm.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) return norm;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const mPadded = isNaN(m) ? '00' : String(m).padStart(2, '0');
  return `${h}:${mPadded} ${ampm}`;
}

/** Calculates clean duration tag like "45m" or "1 hr" or "1h 30m" */
function getDurationLabel(startTime: string, endTime: string): string {
  const start = minutesFromTime(startTime);
  const end = minutesFromTime(endTime);
  const diff = Math.max(0, end - start);
  if (diff === 0) return '';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${mins}m`;
}

function formatMonthYear(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDayNumber(iso: string): number {
  return Number(iso.slice(-2));
}

function formatRelativeDate(iso: string): string {
  if (iso === TODAY) return 'Today';
  if (iso === addDays(TODAY, 1)) return 'Tomorrow';
  if (iso === addDays(TODAY, -1)) return 'Yesterday';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function parseAttendees(attendees: unknown): string[] {
  if (Array.isArray(attendees)) return attendees.filter(Boolean);
  if (typeof attendees === 'string') {
    try {
      const parsed = JSON.parse(attendees);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return attendees.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '•';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Dynamic demo initial events anchored to current day for seamless preview */
const INITIAL_EVENTS: IScheduleEvent[] = [
  {
    id: 'demo-1',
    user_id: 1,
    title: 'Product Design Sync',
    description: 'Weekly review of the new mobile and desktop designs with the design team',
    startTime: '09:00',
    endTime: '10:00',
    date: new Date(TODAY),
    attendees: ['Sarah Chen', 'Alex Rivera', 'Maya Chen'],
    type: 'Meeting',
    location: 'Google Meet',
    created_at: TODAY,
  },
  {
    id: 'demo-2',
    user_id: 1,
    title: 'Focus: Sprint Architecture & Code Review',
    description: 'Deep uninterrupted focus time on the authentication refactor',
    startTime: '10:30',
    endTime: '12:30',
    date: new Date(TODAY),
    attendees: [],
    type: 'Focus',
    location: 'Do Not Disturb',
    created_at: TODAY,
  },
  {
    id: 'demo-3',
    user_id: 1,
    title: 'Client Check-in: Northstar Studio',
    description: 'Bi-weekly milestone check-in and delivery status',
    startTime: '13:30',
    endTime: '14:30',
    date: new Date(TODAY),
    attendees: ['David Kim', 'Amanuel Tadesse'],
    type: 'Meeting',
    location: 'Video Call',
    created_at: TODAY,
  },
  {
    id: 'demo-4',
    user_id: 1,
    title: 'Q4 Product Roadmap Milestone',
    description: 'Submit updated Q4 roadmap and milestone deliverables to leadership',
    startTime: '16:00',
    endTime: '17:00',
    date: new Date(TODAY),
    attendees: ['Elena Rostova'],
    type: 'Deadline',
    location: 'Shared Drive',
    created_at: TODAY,
  },
  {
    id: 'demo-5',
    user_id: 1,
    title: 'Design System Polish',
    description: 'Component cleanup and tokens standardization',
    startTime: '11:00',
    endTime: '12:30',
    date: new Date(addDays(TODAY, 1)),
    attendees: ['Maya Chen', 'Jon Bell'],
    type: 'Focus',
    location: 'Design Lab',
    created_at: TODAY,
  },
  {
    id: 'demo-6',
    user_id: 1,
    title: 'Marketing Strategy & Campaign Review',
    description: 'Review performance metrics and prepare next week launch',
    startTime: '14:00',
    endTime: '15:00',
    date: new Date(addDays(TODAY, 1)),
    attendees: ['Aisha Patel', 'Sarah Chen'],
    type: 'Meeting',
    location: 'Google Meet',
    created_at: TODAY,
  },
  {
    id: 'demo-7',
    user_id: 1,
    title: 'Monthly Invoice Run & Sign-off',
    description: 'Finalize and dispatch all client retainer invoices',
    startTime: '10:00',
    endTime: '11:00',
    date: new Date(addDays(TODAY, 2)),
    attendees: ['Aisha Patel'],
    type: 'Deadline',
    location: 'Finance Portal',
    created_at: TODAY,
  },
  {
    id: 'demo-8',
    user_id: 1,
    title: 'Engineering All-Hands',
    description: 'Engineering department updates and live Q&A',
    startTime: '15:30',
    endTime: '16:30',
    date: new Date(addDays(TODAY, 3)),
    attendees: ['Jon Bell', 'David Kim', 'Alex Rivera'],
    type: 'Meeting',
    location: 'Video Call',
    created_at: TODAY,
  },
];

export function SchedulePage({ preview }: SchedulePageProps) {
  const { status, retry } = useResource({ preview });
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string>(TODAY);
  const [viewMode, setViewMode] = useState<ViewMode>('schedule');
  const [filter, setFilter] = useState<FilterType>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    type: 'error' | 'success' | 'warning';
    message: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Form state
  const [form, setForm] = useState<ICreateScheduleEventInput>({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    date: new Date(TODAY),
    attendees: [],
    type: 'Meeting' as ScheduleEventType,
    location: '',
  });
  const [attendeeInput, setAttendeeInput] = useState('');

  // Fetch real schedules from backend
  const scheduleQuery = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const response = await schedules.list();
      if (!response.success) throw new Error(response.message || 'Failed to load schedules');
      return response.data ?? [];
    },
  });

  const fetchedEvents = scheduleQuery.data ?? [];

  // Active event list: uses database events if present, otherwise demo events
  const allEvents = useMemo(() => {
    if (fetchedEvents.length > 0) return fetchedEvents;
    if (preview === 'empty') return [];
    return INITIAL_EVENTS;
  }, [fetchedEvents, preview]);

  // Filtered by event type
  const filteredEvents = useMemo(() => {
    if (filter === 'All') return allEvents;
    return allEvents.filter((ev) => ev.type === filter);
  }, [allEvents, filter]);

  // 7-day strip based on currently selected week
  const currentWeekStart = useMemo(() => getStartOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(currentWeekStart, index)),
    [currentWeekStart],
  );

  // Events for the selected date
  const dayEvents = useMemo(() => {
    return filteredEvents
      .filter((event) => toISODate(event.date) === selectedDate)
      .sort((a, b) => minutesFromTime(a.startTime) - minutesFromTime(b.startTime));
  }, [filteredEvents, selectedDate]);

  // Deadlines coming up this week
  const upcomingDeadlines = useMemo(() => {
    return allEvents
      .filter((ev) => ev.type === 'Deadline' && toISODate(ev.date) >= TODAY)
      .sort((a, b) => toISODate(a.date).localeCompare(toISODate(b.date)))
      .slice(0, 5);
  }, [allEvents]);

  // Schedule statistics for selected date
  const meetingCount = dayEvents.filter((event) => event.type === 'Meeting').length;
  const deadlineCount = dayEvents.filter((event) => event.type === 'Deadline').length;
  const focusMinutes = dayEvents
    .filter((event) => event.type === 'Focus')
    .reduce(
      (total, event) =>
        total + (minutesFromTime(event.endTime) - minutesFromTime(event.startTime)),
      0,
    );
  const focusHours = Math.round((focusMinutes / 60) * 10) / 10;

  // Real-time current time indicator (Google / iOS calendar red line)
  const currentMinutes = NOW.getHours() * 60 + NOW.getMinutes();
  const isCurrentTimeInRange =
    currentMinutes >= START_HOUR * 60 && currentMinutes <= END_HOUR * 60;
  const currentTimeTop = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof schedules.create>[0]) => schedules.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setIsAdding(false);
      resetForm();
      setToast({
        type: 'success',
        title: 'Event scheduled',
        message: 'New event has been added to your calendar.',
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof schedules.update>[1] }) =>
      schedules.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      setToast({
        type: 'success',
        title: 'Event updated',
        message: 'Your schedule updates have been saved.',
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schedules.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setToast({
        type: 'success',
        title: 'Event removed',
        message: 'The event was removed from your calendar.',
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    },
  });

  function resetForm() {
    setForm({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      date: new Date(selectedDate),
      attendees: [],
      type: 'Meeting',
      location: '',
    });
    setAttendeeInput('');
    setEditingId(null);
    setError(null);
  }

  function handleOpenAddForDate(dateStr?: string) {
    const targetDate = dateStr ?? selectedDate;
    setForm({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      date: new Date(targetDate),
      attendees: [],
      type: 'Meeting',
      location: '',
    });
    setAttendeeInput('');
    setEditingId(null);
    setIsAdding(true);
  }

  function handleStartEdit(event: IScheduleEvent) {
    setEditingId(String(event.id));
    setForm({
      title: event.title,
      description: event.description || '',
      startTime: normalizeTime(event.startTime),
      endTime: normalizeTime(event.endTime),
      date: new Date(toISODate(event.date)),
      attendees: parseAttendees(event.attendees),
      type: event.type,
      location: event.location || '',
    });
    setAttendeeInput(parseAttendees(event.attendees).join(', '));
    setIsAdding(true);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    if (!title) {
      setError('Title is required');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError('Start and end times are required');
      return;
    }

    const payload = {
      title,
      description: form.description.trim(),
      startTime: normalizeTime(form.startTime),
      endTime: normalizeTime(form.endTime),
      date: toISODate(form.date),
      attendees: attendeeInput
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
      type: form.type,
      location: form.location?.trim() || undefined,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        input: payload as unknown as Parameters<typeof schedules.update>[1],
      });
    } else {
      createMutation.mutate(payload as unknown as Parameters<typeof schedules.create>[0]);
    }
  }

  function handleDeleteEvent(id: string | number) {
    deleteMutation.mutate(String(id));
  }

  return (
    <TaskflowShell>
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          className={cn(
            'toast flex items-start gap-3 shadow-lg backdrop-blur-md',
            toast.type === 'success' && 'toast-success',
            toast.type === 'error' && 'toast-error',
            toast.type === 'warning' && 'border-l-4 border-l-amber-500',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0 text-[#10b981]" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-[#ef4444]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">{toast.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        eyebrow="CALENDAR & PLANNING"
        title="Schedule"
        description="Plan meetings, protect deep focus, and hit critical project milestones."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenAddForDate(selectedDate)}
              className="primary-button flex items-center gap-2 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Add event</span>
            </button>
          </div>
        }
      />

      {/* Add / Edit Event Form Shell (Google Calendar Event Modal Style) */}
      {isAdding ? (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <FormShell
            title={editingId ? 'Edit event' : 'Add new event'}
            description="Meetings, deadlines, and focus blocks live in the same unified timeline."
            onCancel={() => {
              setIsAdding(false);
              resetForm();
            }}
            onSubmit={handleFormSubmit}
            submitLabel={editingId ? 'Save changes' : 'Add event'}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          >
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event title" htmlFor="event-title" className="sm:col-span-2">
                <input
                  id="event-title"
                  value={form.title}
                  onChange={(e) => setForm((curr) => ({ ...curr, title: e.target.value }))}
                  placeholder="e.g. Design review, Team sync, Deep work"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Type" htmlFor="event-type">
                <div className="grid grid-cols-3 gap-2">
                  {(['Meeting', 'Deadline', 'Focus'] as ScheduleEventType[]).map((typeOption) => {
                    const isSelected = form.type === typeOption;
                    const theme = eventTheme[typeOption];
                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() => setForm((curr) => ({ ...curr, type: typeOption }))}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition',
                          isSelected
                            ? `${theme.cardBg} ${theme.border} ${theme.text} shadow-xs ring-2 ring-slate-900/10`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                        )}
                        style={isSelected ? { borderColor: theme.accent } : undefined}
                      >
                        <span className={cn('size-2 rounded-full', theme.dot)} />
                        {typeOption}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Date" htmlFor="event-date">
                <input
                  id="event-date"
                  type="date"
                  value={toISODate(form.date)}
                  onChange={(e) =>
                    setForm((curr) => ({ ...curr, date: new Date(e.target.value) }))
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Start time" htmlFor="event-start">
                <div className="relative">
                  <input
                    id="event-start"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((curr) => ({ ...curr, startTime: e.target.value }))}
                    className={inputClass}
                    required
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="End time" htmlFor="event-end">
                <div className="relative">
                  <input
                    id="event-end"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((curr) => ({ ...curr, endTime: e.target.value }))}
                    className={inputClass}
                    required
                  />
                  <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Location or Link" htmlFor="event-location">
                <div className="relative">
                  <input
                    id="event-location"
                    value={form.location ?? ''}
                    onChange={(e) => setForm((curr) => ({ ...curr, location: e.target.value }))}
                    placeholder="e.g. Google Meet, Room 402, Video call"
                    className={inputClass}
                  />
                  <MapPin className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field
                label="Attendees"
                htmlFor="event-attendees"
                hint="Separate names with commas"
              >
                <div className="relative">
                  <input
                    id="event-attendees"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    placeholder="Sarah Chen, Marcus Reed, Alex Rivera"
                    className={inputClass}
                  />
                  <Users className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Description" htmlFor="event-description" className="sm:col-span-2">
                <textarea
                  id="event-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((curr) => ({ ...curr, description: e.target.value }))
                  }
                  placeholder="Add notes, agenda items, or project context..."
                  className={cn(inputClass, 'h-auto py-2.5')}
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      {/* Google Calendar & iPhone Calendar Navigation Header + Week Strip Panel */}
      <section className="panel mb-6 overflow-hidden border border-slate-100 bg-white shadow-sm">
        {/* Top Control Bar: Month Year Display, Prev/Next, Today, View Switcher & Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {formatMonthYear(selectedDate)}
                </h2>
                {selectedDate === TODAY && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Today
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Week of {formatShortWeekday(weekDays[0])} {formatDayNumber(weekDays[0])} –{' '}
                {formatShortWeekday(weekDays[6])} {formatDayNumber(weekDays[6])}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Prev / Today / Next Controls */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedDate((curr) => addDays(curr, viewMode === 'day' ? -1 : -7))}
                aria-label="Previous"
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(TODAY)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate((curr) => addDays(curr, viewMode === 'day' ? 1 : 7))}
                aria-label="Next"
                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Google / Apple Calendar View Modes: Schedule (Agenda) | Day (Timeline) | Week */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('schedule')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                  viewMode === 'schedule'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <List className="size-3.5" />
                <span>Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                  viewMode === 'day'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <Clock className="size-3.5" />
                <span>Day</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                  viewMode === 'week'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <CalendarRange className="size-3.5" />
                <span>Week</span>
              </button>
            </div>
          </div>
        </div>

        {/* iPhone / iOS Calendar Style Week Strip */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((dayIso) => {
              const isSelected = dayIso === selectedDate;
              const isTodayDay = dayIso === TODAY;
              const dayEvs = allEvents.filter((ev) => toISODate(ev.date) === dayIso);
              const eventCount = dayEvs.length;

              // Distinct event type dots (Apple Calendar signature dots)
              const hasMeeting = dayEvs.some((e) => e.type === 'Meeting');
              const hasDeadline = dayEvs.some((e) => e.type === 'Deadline');
              const hasFocus = dayEvs.some((e) => e.type === 'Focus');

              return (
                <button
                  key={dayIso}
                  type="button"
                  onClick={() => setSelectedDate(dayIso)}
                  className={cn(
                    'group relative flex flex-col items-center justify-between rounded-2xl py-3 px-1 transition-all duration-200',
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50/60 text-slate-700 hover:bg-slate-100/90',
                  )}
                >
                  {/* Weekday abbreviation */}
                  <span
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      isSelected
                        ? 'text-slate-300'
                        : isTodayDay
                          ? 'text-[#2563eb]'
                          : 'text-slate-500',
                    )}
                  >
                    {formatShortWeekday(dayIso)}
                  </span>

                  {/* Day of Month circle */}
                  <div
                    className={cn(
                      'my-1.5 flex size-9 items-center justify-center rounded-full text-base font-bold transition-all',
                      isSelected
                        ? 'bg-[#2563eb] text-white shadow-sm ring-2 ring-white/30'
                        : isTodayDay
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'text-slate-800 group-hover:scale-105',
                    )}
                  >
                    {formatDayNumber(dayIso)}
                  </div>

                  {/* Apple Calendar signature event dot indicators */}
                  <div className="flex h-1.5 items-center justify-center gap-1">
                    {hasMeeting && (
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isSelected ? 'bg-blue-300' : 'bg-blue-500',
                        )}
                      />
                    )}
                    {hasDeadline && (
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isSelected ? 'bg-red-300' : 'bg-red-500',
                        )}
                      />
                    )}
                    {hasFocus && (
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isSelected ? 'bg-emerald-300' : 'bg-emerald-500',
                        )}
                      />
                    )}
                    {eventCount === 0 && <span className="size-1.5 opacity-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            {(['All', 'Meeting', 'Deadline', 'Focus'] as FilterType[]).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {f === 'All' ? 'All events' : f}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{dayEvents.length}</strong> event
            {dayEvents.length === 1 ? '' : 's'} on {formatRelativeDate(selectedDate)}
          </div>
        </div>
      </section>

      {/* Main Calendar Area + Companion Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area: Schedule List / Day Timeline / Week View */}
        <section className="panel overflow-hidden border border-slate-100 bg-white p-0 shadow-sm lg:col-span-2">
          {/* Panel Top Banner with Date & Quick stats */}
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {formatDateDisplay(selectedDate)}
                </h3>
                {selectedDate === TODAY && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    Today
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {dayEvents.length} scheduled · {meetingCount} meeting
                {meetingCount === 1 ? '' : 's'} · {focusHours}h focus · {deadlineCount} deadline
                {deadlineCount === 1 ? '' : 's'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddForDate(selectedDate)}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <Plus className="size-3.5 text-slate-600" />
              <span>Add for this day</span>
            </button>
          </div>

          {/* Body: Loading / Error / Views */}
          {status === 'loading' ? (
            <div className="p-6">
              <PageLoading label="Loading calendar events…" rows={4} />
            </div>
          ) : status === 'error' ? (
            <div className="p-6">
              <PageError message={error ?? 'Could not load your calendar.'} onRetry={retry} />
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              {/* VIEW 1: GOOGLE CALENDAR SCHEDULE (AGENDA) VIEW */}
              {viewMode === 'schedule' && (
                <div className="space-y-6">
                  {dayEvents.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      title="No events scheduled for this day"
                      description="Enjoy the open time or schedule a meeting, client deadline, or focus block."
                      action={
                        <button
                          type="button"
                          onClick={() => handleOpenAddForDate(selectedDate)}
                          className="primary-button"
                        >
                          <Plus className="size-4" /> Add event
                        </button>
                      }
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {dayEvents.map((event) => {
                        const theme = eventTheme[event.type];
                        const attendeesList = parseAttendees(event.attendees);
                        const isVideo =
                          event.location &&
                          /meet|zoom|call|video|teams|hangout/i.test(event.location);

                        return (
                          <article
                            key={event.id}
                            className={cn(
                              'group relative my-3 flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:shadow-md sm:flex-row sm:items-start sm:gap-4',
                              theme.cardBg,
                              theme.border,
                              theme.borderLeft,
                              'border-l-4',
                            )}
                          >
                            {/* Time badge column (Google / Apple Calendar layout) */}
                            <div className="flex shrink-0 items-center justify-between sm:w-36 sm:flex-col sm:items-start sm:justify-start">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                <Clock className="size-3.5 text-slate-500" />
                                <span>{formatTime12h(event.startTime)}</span>
                              </div>
                              <div className="text-[11px] font-medium text-slate-500 sm:mt-1">
                                to {formatTime12h(event.endTime)}
                              </div>
                              <span className="mt-1 inline-flex rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
                                {getDurationLabel(event.startTime, event.endTime)}
                              </span>
                            </div>

                            {/* Event details column */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-base font-bold text-slate-900">
                                      {event.title}
                                    </h4>
                                    <span
                                      className={cn(
                                        'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                                        theme.badge,
                                      )}
                                    >
                                      {event.type}
                                    </span>
                                  </div>
                                  {event.description && (
                                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                </div>

                                {/* Hover actions: Edit & Delete */}
                                <div className="flex shrink-0 items-center gap-1 opacity-90 transition group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(event)}
                                    aria-label={`Edit ${event.title}`}
                                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-900"
                                  >
                                    <Edit2 className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    aria-label={`Remove ${event.title}`}
                                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-red-600"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Footer metadata: Location & Attendees */}
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/50 pt-2.5 text-xs text-slate-600">
                                {event.location && (
                                  <div className="inline-flex items-center gap-1.5 font-medium">
                                    {isVideo ? (
                                      <Video className="size-3.5 text-blue-600" />
                                    ) : (
                                      <MapPin className="size-3.5 text-slate-500" />
                                    )}
                                    <span>{event.location}</span>
                                  </div>
                                )}

                                {attendeesList.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Users className="size-3.5 text-slate-500" />
                                    <div className="flex -space-x-1 overflow-hidden">
                                      {attendeesList.slice(0, 3).map((name) => (
                                        <span
                                          key={name}
                                          title={name}
                                          className={cn(
                                            'inline-flex size-5 items-center justify-center rounded-full text-[9px] font-bold ring-1 ring-white',
                                            theme.avatarBg,
                                            theme.avatarText,
                                          )}
                                        >
                                          {getInitials(name)}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-[11px] text-slate-500">
                                      {attendeesList.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: GOOGLE CALENDAR & APPLE CALENDAR HOURLY DAY TIMELINE */}
              {viewMode === 'day' && (
                <div className="relative">
                  {dayEvents.length === 0 ? (
                    <div className="mb-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                      No events placed in the hourly timeline today. Click "+ Add for this day" to schedule.
                    </div>
                  ) : null}

                  <div className="flex">
                    {/* Time Gutter Column */}
                    <div className="w-16 shrink-0 select-none pr-3">
                      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => {
                        const hour = START_HOUR + index;
                        const h12 = hour % 12 === 0 ? 12 : hour % 12;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        return (
                          <div
                            key={hour}
                            style={{ height: HOUR_HEIGHT }}
                            className="flex items-start justify-end text-[11px] font-semibold text-slate-400"
                          >
                            <span>
                              {h12} {ampm}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Grid Canvas */}
                    <div
                      className="relative flex-1 border-l border-slate-200"
                      style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
                    >
                      {/* Hour divider lines */}
                      {Array.from({ length: END_HOUR - START_HOUR }, (_, index) => (
                        <div
                          key={index}
                          className="absolute left-0 right-0 border-b border-slate-100"
                          style={{ top: index * HOUR_HEIGHT }}
                        >
                          {/* Subtle half-hour mark */}
                          <div
                            className="absolute left-0 right-0 border-b border-dashed border-slate-100/60"
                            style={{ top: HOUR_HEIGHT / 2 }}
                          />
                        </div>
                      ))}

                      {/* Google/Apple Calendar Red "Current Time" Indicator Line */}
                      {selectedDate === TODAY && isCurrentTimeInRange && (
                        <div
                          className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
                          style={{ top: currentTimeTop }}
                        >
                          <div className="absolute -left-3 size-2.5 rounded-full bg-red-500 shadow-sm ring-2 ring-white" />
                          <div className="w-full border-t-2 border-red-500" />
                        </div>
                      )}

                      {/* Positioned Event Cards */}
                      {dayEvents.map((event) => {
                        const startMin = minutesFromTime(event.startTime);
                        const endMin = minutesFromTime(event.endTime);
                        const duration = Math.max(25, endMin - startMin);

                        const top =
                          Math.max(0, (startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                        const height = Math.max(34, (duration / 60) * HOUR_HEIGHT - 4);
                        const theme = eventTheme[event.type];

                        return (
                          <div
                            key={event.id}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            className={cn(
                              'group absolute inset-x-2 z-10 flex flex-col justify-between overflow-hidden rounded-xl border p-2.5 shadow-sm transition hover:z-20 hover:shadow-md',
                              theme.cardBg,
                              theme.border,
                              theme.borderLeft,
                              'border-l-4',
                            )}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={cn('size-1.5 rounded-full', theme.dot)} />
                                  <h5 className="truncate text-xs font-bold text-slate-900">
                                    {event.title}
                                  </h5>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                                  <span>
                                    {formatTime12h(event.startTime)} –{' '}
                                    {formatTime12h(event.endTime)}
                                  </span>
                                  {event.location && (
                                    <span className="truncate text-slate-400">
                                      · {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(event)}
                                  className="rounded p-1 text-slate-500 hover:bg-white hover:text-slate-900"
                                >
                                  <Edit2 className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="rounded p-1 text-slate-500 hover:bg-white hover:text-red-600"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: 7-DAY WEEK OVERVIEW */}
              {viewMode === 'week' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-7">
                  {weekDays.map((dayIso) => {
                    const isSelected = dayIso === selectedDate;
                    const isTodayDay = dayIso === TODAY;
                    const dayEvs = filteredEvents.filter((ev) => toISODate(ev.date) === dayIso);

                    return (
                      <div
                        key={dayIso}
                        onClick={() => setSelectedDate(dayIso)}
                        className={cn(
                          'flex flex-col rounded-xl border p-2.5 transition cursor-pointer',
                          isSelected
                            ? 'border-[#2563eb] bg-blue-50/20 ring-1 ring-[#2563eb]'
                            : 'border-slate-100 bg-white hover:border-slate-200',
                        )}
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-[11px] font-bold text-slate-600">
                            {formatShortWeekday(dayIso)}
                          </span>
                          <span
                            className={cn(
                              'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                              isTodayDay
                                ? 'bg-[#2563eb] text-white'
                                : isSelected
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-800',
                            )}
                          >
                            {formatDayNumber(dayIso)}
                          </span>
                        </div>

                        <div className="space-y-1.5 min-h-[140px]">
                          {dayEvs.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic pt-2 text-center">
                              Free day
                            </p>
                          ) : (
                            dayEvs.map((ev) => {
                              const theme = eventTheme[ev.type];
                              return (
                                <div
                                  key={ev.id}
                                  className={cn(
                                    'rounded-lg border p-1.5 text-[11px] font-medium leading-tight',
                                    theme.cardBg,
                                    theme.border,
                                    theme.borderLeft,
                                    'border-l-2',
                                  )}
                                >
                                  <div className="truncate font-bold text-slate-900">{ev.title}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {formatTime12h(ev.startTime)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sidebar Companion Widgets (Google & iPhone Calendar companion panels) */}
        <aside className="space-y-6">
          {/* Widget 1: Day Overview Card */}
          <div className="panel border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Day Overview</h4>
                <p className="text-xs text-slate-500">{formatRelativeDate(selectedDate)}</p>
              </div>
              <Calendar className="size-4 text-slate-400" />
            </div>

            {/* Quick Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-blue-50/80 p-2.5">
                <p className="text-lg font-bold text-blue-700">{meetingCount}</p>
                <p className="text-[10px] font-semibold text-blue-600">Meetings</p>
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-2.5">
                <p className="text-lg font-bold text-emerald-700">{focusHours}h</p>
                <p className="text-[10px] font-semibold text-emerald-600">Focus</p>
              </div>
              <div className="rounded-xl bg-red-50/80 p-2.5">
                <p className="text-lg font-bold text-red-700">{deadlineCount}</p>
                <p className="text-[10px] font-semibold text-red-600">Deadlines</p>
              </div>
            </div>

            {/* Mini Agenda of the selected day */}
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Timeline Flow
              </p>
              {dayEvents.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400 italic">No scheduled items today.</p>
              ) : (
                <ul className="mt-2 space-y-2.5">
                  {dayEvents.map((ev) => (
                    <li key={ev.id} className="flex items-start gap-2.5 text-xs">
                      <span
                        className={cn(
                          'mt-1 size-2 shrink-0 rounded-full',
                          eventTheme[ev.type].dot,
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">{ev.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatTime12h(ev.startTime)} – {formatTime12h(ev.endTime)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Widget 2: Upcoming Deadlines Card */}
          <div className="panel border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h4>
                <p className="text-xs text-slate-500">Priorities requiring delivery</p>
              </div>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {upcomingDeadlines.length}
              </span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500">No active deadlines left for this period.</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {upcomingDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-red-100 bg-red-50/40 p-2.5 transition hover:bg-red-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{dl.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatRelativeDate(toISODate(dl.date))} · {formatTime12h(dl.startTime)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                      Due
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </TaskflowShell>
  );
}

export default SchedulePage;
