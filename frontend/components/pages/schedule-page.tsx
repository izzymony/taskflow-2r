'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Inbox,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Bell,
  Layers,
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

type ViewMode = 'timeline' | 'agenda';
type FilterType = 'All' | ScheduleEventType;

// Setup constants
const NOW = new Date();
const TODAY = `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, '0')}-${String(NOW.getDate()).padStart(2, '0')}`;
// Default to 14 Nov 2026 if today is in demo mode or user wants reference match, else TODAY
const DEFAULT_DATE = '2026-11-14';

// 24-hour range matching the iOS screenshot (06:00 to 23:00)
const START_HOUR = 6;
const END_HOUR = 23;
const HOUR_HEIGHT = 62;

/**
 * Authentic Apple iOS Calendar Theme colors (dark mode)
 * Meeting matches the exact cyan/teal palette from the screenshot (DEV FEST LAGOS 2026)
 */
const iosEventThemes: Record<
  ScheduleEventType,
  {
    cardBg: string;
    border: string;
    stripe: string;
    title: string;
    timeText: string;
    dot: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  Meeting: {
    cardBg: 'bg-[#152730]/95',
    border: 'border-[#1e3d4a]',
    stripe: 'bg-[#4ecdc4]',
    title: 'text-[#7fe7eb]',
    timeText: 'text-[#5ca7b3]',
    dot: 'bg-[#4ecdc4]',
    badgeBg: 'bg-[#1e3d4a]',
    badgeText: 'text-[#7fe7eb]',
  },
  Deadline: {
    cardBg: 'bg-[#2b171a]/95',
    border: 'border-[#4a2227]',
    stripe: 'bg-[#ff453a]',
    title: 'text-[#ffa1a7]',
    timeText: 'text-[#d66b72]',
    dot: 'bg-[#ff453a]',
    badgeBg: 'bg-[#4a2227]',
    badgeText: 'text-[#ffa1a7]',
  },
  Focus: {
    cardBg: 'bg-[#14261b]/95',
    border: 'border-[#1f3f2b]',
    stripe: 'bg-[#30d158]',
    title: 'text-[#82e5a4]',
    timeText: 'text-[#51b373]',
    dot: 'bg-[#30d158]',
    badgeBg: 'bg-[#1f3f2b]',
    badgeText: 'text-[#82e5a4]',
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

/** Get Monday of the week for an ISO date */
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

/** Formats 24h string (e.g. 13:30) to 24h format e.g. 13:30 (matching screenshot) */
function formatTime24h(timeStr: string): string {
  return normalizeTime(timeStr);
}

/** Formats 24h string to 12h AM/PM */
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

/** Full month name for top left (e.g. "November") */
function formatMonthName(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long' });
}

/** Subheader banner matching screenshot: "Saturday – 14 Nov 2026" */
function formatIPhoneBannerDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${weekday} – ${dayNum} ${month} ${year}`;
}

function formatDayNumber(iso: string): number {
  return Number(iso.slice(-2));
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

/**
 * High-fidelity initial demo events anchored to the reference screenshot
 * (DEV FEST LAGOS 2026 on Saturday 14 Nov 2026) and today's schedule
 */
const INITIAL_EVENTS: IScheduleEvent[] = [
  {
    id: 'event-devfest',
    user_id: 1,
    title: 'DEV FEST LAGOS 2026',
    description: 'Annual Google Developer Group Tech Conference & Keynotes',
    startTime: '12:00',
    endTime: '13:00',
    date: new Date('2026-11-14'),
    attendees: ['Amanuel Tadesse', 'Maya Chen', 'Sarah Chen'],
    type: 'Meeting',
    location: 'Landmark Centre, Lagos',
    created_at: '2026-11-14',
  },
  {
    id: 'demo-1',
    user_id: 1,
    title: 'PRODUCT DESIGN SYNC',
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
    title: 'FOCUS: SPRINT ARCHITECTURE',
    description: 'Deep uninterrupted focus time on the authentication refactor',
    startTime: '10:30',
    endTime: '12:00',
    date: new Date(TODAY),
    attendees: [],
    type: 'Focus',
    location: 'Do Not Disturb',
    created_at: TODAY,
  },
  {
    id: 'demo-3',
    user_id: 1,
    title: 'CLIENT CHECK-IN: NORTHSTAR STUDIO',
    description: 'Bi-weekly milestone check-in and delivery status',
    startTime: '14:00',
    endTime: '15:00',
    date: new Date(TODAY),
    attendees: ['David Kim', 'Amanuel Tadesse'],
    type: 'Meeting',
    location: 'Video Call',
    created_at: TODAY,
  },
  {
    id: 'demo-4',
    user_id: 1,
    title: 'Q4 ROADMAP SUBMISSION',
    description: 'Submit updated Q4 roadmap and milestone deliverables to leadership',
    startTime: '16:30',
    endTime: '17:30',
    date: new Date(TODAY),
    attendees: ['Elena Rostova'],
    type: 'Deadline',
    location: 'Shared Drive',
    created_at: TODAY,
  },
  {
    id: 'demo-5',
    user_id: 1,
    title: 'ENGINEERING ALL-HANDS',
    description: 'Department updates, releases review, and team Q&A',
    startTime: '15:00',
    endTime: '16:30',
    date: new Date('2026-11-14'),
    attendees: ['Jon Bell', 'David Kim', 'Alex Rivera'],
    type: 'Meeting',
    location: 'Virtual Auditorium',
    created_at: '2026-11-14',
  },
  {
    id: 'demo-6',
    user_id: 1,
    title: 'COMMUNITY MIXER & KEYNOTE',
    description: 'Developer networking and community showcase',
    startTime: '17:00',
    endTime: '18:30',
    date: new Date('2026-11-14'),
    attendees: ['Amanuel Tadesse', 'Maya Chen'],
    type: 'Meeting',
    location: 'Lagos Island Lounge',
    created_at: '2026-11-14',
  },
];

export function SchedulePage({ preview }: SchedulePageProps) {
  const { status, retry } = useResource({ preview });
  const queryClient = useQueryClient();

  // Active selected date: default to Nov 14 2026 matching the screenshot
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>('event-devfest');
  const [showInboxDrawer, setShowInboxDrawer] = useState(false);
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

  // Form state for creating or editing events
  const [form, setForm] = useState<ICreateScheduleEventInput>({
    title: '',
    description: '',
    startTime: '12:00',
    endTime: '13:00',
    date: new Date(selectedDate),
    attendees: [],
    type: 'Meeting' as ScheduleEventType,
    location: '',
  });
  const [attendeeInput, setAttendeeInput] = useState('');

  // Fetch real schedules from backend API
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

  // Filtered by event type and search query
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchesType = filter === 'All' || ev.type === filter;
      if (!matchesType) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const attendees = parseAttendees(ev.attendees).join(' ').toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.description && ev.description.toLowerCase().includes(q)) ||
        (ev.location && ev.location.toLowerCase().includes(q)) ||
        attendees.includes(q)
      );
    });
  }, [allEvents, filter, searchQuery]);

  // 7-day strip based on currently selected week (Monday to Sunday like iOS)
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

  // Active selected event object (for details inspection)
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return dayEvents[0] || null;
    return allEvents.find((e) => String(e.id) === String(selectedEventId)) || dayEvents[0] || null;
  }, [allEvents, dayEvents, selectedEventId]);

  // Deadlines coming up this week
  const upcomingDeadlines = useMemo(() => {
    return allEvents
      .filter((ev) => ev.type === 'Deadline')
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

  // Real-time current time indicator
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
      startTime: '12:00',
      endTime: '13:00',
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
      startTime: '12:00',
      endTime: '13:00',
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
            'toast flex items-start gap-3 shadow-2xl backdrop-blur-md',
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
        eyebrow="CALENDAR & SCHEDULE"
        title="Schedule"
        description="Native iPhone-style calendar timeline and event scheduler."
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

      {/* Add / Edit Event Form Modal / Slide-down */}
      {isAdding ? (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <FormShell
            title={editingId ? 'Edit event' : 'New event'}
            description="Add or edit meetings, focus blocks, and milestone deadlines."
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
                  placeholder="e.g. DEV FEST LAGOS 2026"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Type" htmlFor="event-type">
                <div className="grid grid-cols-3 gap-2">
                  {(['Meeting', 'Deadline', 'Focus'] as ScheduleEventType[]).map((typeOption) => {
                    const isSelected = form.type === typeOption;
                    const theme = iosEventThemes[typeOption];
                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() => setForm((curr) => ({ ...curr, type: typeOption }))}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition',
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                        )}
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

              <Field label="Location or Venue" htmlFor="event-location">
                <div className="relative">
                  <input
                    id="event-location"
                    value={form.location ?? ''}
                    onChange={(e) => setForm((curr) => ({ ...curr, location: e.target.value }))}
                    placeholder="e.g. Landmark Centre, Lagos"
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
                    placeholder="Amanuel Tadesse, Maya Chen, Sarah Chen"
                    className={inputClass}
                  />
                  <Users className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field label="Description / Agenda" htmlFor="event-description" className="sm:col-span-2">
                <textarea
                  id="event-description"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((curr) => ({ ...curr, description: e.target.value }))
                  }
                  placeholder="Event details, keynote notes, or meeting agenda..."
                  className={cn(inputClass, 'h-auto py-2.5')}
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      {/* Main Container: Responsive Grid with the iPhone Calendar as centerpiece */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* IPHONE CALENDAR INTERFACE (Matching Reference Screenshot) */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl bg-black text-white shadow-2xl ring-1 ring-white/10 sm:rounded-[36px]">
            {/* Top iOS Header Bar: < Month on Left | Action Pills on Right */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3 sm:px-6">
              {/* Back / Month Navigation Pill */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDate((curr) => addDays(curr, -7))}
                  className="group flex items-center gap-1 rounded-full bg-[#1c1c1e] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#2c2c2e] active:scale-95"
                >
                  <ChevronLeft className="size-4 stroke-[2.5] text-white transition-transform group-hover:-translate-x-0.5" />
                  <span>{formatMonthName(selectedDate)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDate((curr) => addDays(curr, 7))}
                  aria-label="Next week"
                  className="rounded-full bg-[#1c1c1e] p-1.5 text-zinc-400 transition hover:bg-[#2c2c2e] hover:text-white"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Right Action Pill Group: [View Toggle, Search, Add Event] */}
              <div className="flex items-center rounded-full bg-[#1c1c1e] p-1 text-white shadow-inner">
                {/* View toggle (Agenda vs Timeline) */}
                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === 'timeline' ? 'agenda' : 'timeline'))}
                  title={viewMode === 'timeline' ? 'Switch to Agenda view' : 'Switch to Timeline view'}
                  className={cn(
                    'rounded-full p-2 text-zinc-300 transition hover:text-white active:scale-95',
                    viewMode === 'agenda' ? 'bg-[#2c2c2e] text-white' : '',
                  )}
                >
                  <Layers className="size-4" />
                </button>

                {/* Search toggle */}
                <button
                  type="button"
                  onClick={() => setIsSearching((s) => !s)}
                  title="Search events"
                  className={cn(
                    'rounded-full p-2 text-zinc-300 transition hover:text-white active:scale-95',
                    isSearching ? 'bg-[#2c2c2e] text-white' : '',
                  )}
                >
                  <Search className="size-4" />
                </button>

                {/* Add event button */}
                <button
                  type="button"
                  onClick={() => handleOpenAddForDate(selectedDate)}
                  title="Add new event"
                  className="rounded-full p-2 text-zinc-300 transition hover:text-white active:scale-95"
                >
                  <Plus className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Optional Collapsible Search Bar */}
            {isSearching && (
              <div className="animate-in fade-in slide-in-from-top-1 px-4 pb-2 sm:px-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, locations, speakers..."
                    className="w-full rounded-xl border border-zinc-800 bg-[#1c1c1e] py-1.5 pr-8 pl-9 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-600"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 7-Day Week Strip: M T W T F S S with circular date indicators */}
            <div className="px-2 pt-1 pb-3 sm:px-4">
              <div className="grid grid-cols-7 text-center">
                {/* Weekday single letters (M T W T F S S) */}
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayLetter, idx) => (
                  <div key={idx} className="text-[11px] font-semibold text-zinc-400">
                    {dayLetter}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 text-center">
                {weekDays.map((dayIso) => {
                  const isSelected = dayIso === selectedDate;
                  const isTodayDay = dayIso === TODAY;
                  const dayEvs = allEvents.filter((ev) => toISODate(ev.date) === dayIso);

                  return (
                    <div key={dayIso} className="flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(dayIso);
                          const ev = allEvents.find((e) => toISODate(e.date) === dayIso);
                          if (ev) setSelectedEventId(String(ev.id));
                        }}
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all sm:size-9 sm:text-base',
                          isSelected
                            ? 'bg-white font-bold text-black shadow-md'
                            : isTodayDay
                              ? 'text-[#4ecdc4] hover:bg-[#1c1c1e]'
                              : 'text-zinc-200 hover:bg-[#1c1c1e]',
                        )}
                      >
                        {formatDayNumber(dayIso)}
                      </button>

                      {/* Event indicator dot */}
                      <div className="mt-1 flex h-1 items-center justify-center gap-0.5">
                        {dayEvs.length > 0 ? (
                          <span
                            className={cn(
                              'size-1 rounded-full',
                              isSelected ? 'bg-zinc-400' : 'bg-[#4ecdc4]',
                            )}
                          />
                        ) : (
                          <span className="size-1 opacity-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Subheader Banner: "Saturday – 14 Nov 2026" */}
            <div className="border-t border-zinc-900 bg-black py-2.5 text-center">
              <h3 className="text-sm font-semibold tracking-wide text-white sm:text-base">
                {formatIPhoneBannerDate(selectedDate)}
              </h3>
            </div>

            {/* HOURLY TIMELINE CANVAS (Exact match to screenshot) */}
            {viewMode === 'timeline' ? (
              <div
                className="relative h-[560px] overflow-y-auto border-t border-zinc-900 bg-black pr-2 select-none sm:h-[620px]"
                tabIndex={0}
                aria-label="Timeline schedule"
              >
                {/* Hour Guidelines and Labels (06:00 to 23:00) */}
                {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => {
                  const hour = START_HOUR + index;
                  const timeLabel = `${String(hour).padStart(2, '0')}:00`;
                  const topPos = index * HOUR_HEIGHT;

                  return (
                    <div
                      key={hour}
                      className="absolute inset-x-0 flex items-center"
                      style={{ top: `${topPos}px` }}
                    >
                      {/* Left Time Label (06:00, 07:00, etc.) */}
                      <div className="w-14 shrink-0 pr-3 text-right text-[11px] font-medium text-zinc-500 sm:w-16 sm:text-xs">
                        {timeLabel}
                      </div>

                      {/* Thin horizontal guideline */}
                      <div className="flex-1 border-b border-zinc-900" />
                    </div>
                  );
                })}

                {/* Live Red "Current Time" Indicator Line (if today is selected) */}
                {selectedDate === TODAY && isCurrentTimeInRange && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="w-14 shrink-0 pr-1 text-right text-[10px] font-bold text-red-500 sm:w-16">
                      <span className="inline-block size-2 rounded-full bg-red-500 ring-2 ring-red-900/60" />
                    </div>
                    <div className="flex-1 border-t-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
                  </div>
                )}

                {/* Event Cards Rendered on Timeline */}
                <div
                  className="relative ml-14 sm:ml-16"
                  style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}
                >
                  {dayEvents.length === 0 ? (
                    <div className="absolute inset-x-4 top-20 rounded-2xl border border-zinc-900 bg-[#121214]/60 p-6 text-center text-xs text-zinc-500">
                      <p>No events scheduled for {formatIPhoneBannerDate(selectedDate)}.</p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddForDate(selectedDate)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1c1c1e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2c2c2e]"
                      >
                        <Plus className="size-3.5" />
                        <span>Add event</span>
                      </button>
                    </div>
                  ) : null}

                  {dayEvents.map((event) => {
                    const startMin = minutesFromTime(event.startTime);
                    const endMin = minutesFromTime(event.endTime);
                    const duration = Math.max(30, endMin - startMin);

                    // Offset top position relative to START_HOUR
                    const top = Math.max(0, ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT);
                    const height = Math.max(44, (duration / 60) * HOUR_HEIGHT - 2);
                    const theme = iosEventThemes[event.type] || iosEventThemes.Meeting;
                    const isSelected = selectedEventId === String(event.id);

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEventId(String(event.id))}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        className={cn(
                          'group absolute inset-x-2 z-10 flex cursor-pointer items-start overflow-hidden rounded-lg border transition-all sm:inset-x-3',
                          theme.cardBg,
                          theme.border,
                          isSelected ? 'ring-1 ring-white/40' : 'hover:ring-1 hover:ring-white/20',
                        )}
                      >
                        {/* Left Vertical Accent Stripe (matching reference screenshot) */}
                        <div className={cn('h-full w-1 shrink-0 rounded-l sm:w-1.5', theme.stripe)} />

                        {/* Card Information */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-1.5">
                          {/* Title */}
                          <h4
                            className={cn(
                              'truncate text-xs font-bold tracking-wide uppercase sm:text-sm',
                              theme.title,
                            )}
                          >
                            {event.title}
                          </h4>

                          {/* Time with Clock icon */}
                          <div
                            className={cn(
                              'mt-0.5 flex items-center gap-1.5 text-[11px] font-medium sm:text-xs',
                              theme.timeText,
                            )}
                          >
                            <Clock className="size-3 shrink-0" />
                            <span>
                              {formatTime24h(event.startTime)} – {formatTime24h(event.endTime)}
                            </span>
                            {event.location ? (
                              <span className="truncate opacity-70">· {event.location}</span>
                            ) : null}
                          </div>
                        </div>

                        {/* Hover Quick Edit / Delete Controls */}
                        <div className="flex shrink-0 items-center gap-0.5 pr-2 pt-1.5 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(event);
                            }}
                            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                            title="Edit event"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-red-400"
                            title="Delete event"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* AGENDA LIST VIEW */
              <div className="h-[560px] overflow-y-auto border-t border-zinc-900 bg-black p-4 sm:h-[620px] sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">
                    Events for {formatIPhoneBannerDate(selectedDate)}
                  </span>
                  <span className="rounded-full bg-[#1c1c1e] px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                    {dayEvents.length} total
                  </span>
                </div>

                {dayEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    No events scheduled for this day.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map((event) => {
                      const theme = iosEventThemes[event.type] || iosEventThemes.Meeting;
                      const attendees = parseAttendees(event.attendees);

                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEventId(String(event.id))}
                          className={cn(
                            'group flex cursor-pointer items-start rounded-xl border p-3 transition',
                            theme.cardBg,
                            theme.border,
                            selectedEventId === String(event.id) ? 'ring-1 ring-white/40' : '',
                          )}
                        >
                          <div className={cn('h-10 w-1 shrink-0 rounded-full', theme.stripe)} />
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={cn('text-sm font-bold uppercase', theme.title)}>
                                {event.title}
                              </h4>
                              <span
                                className={cn(
                                  'rounded-md px-2 py-0.5 text-[10px] font-bold',
                                  theme.badgeBg,
                                  theme.badgeText,
                                )}
                              >
                                {event.type}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                              <Clock className="size-3.5" />
                              <span>
                                {formatTime24h(event.startTime)} – {formatTime24h(event.endTime)}
                              </span>
                            </div>

                            {event.location ? (
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                                <MapPin className="size-3.5" />
                                <span>{event.location}</span>
                              </div>
                            ) : null}

                            {attendees.length > 0 ? (
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                                <Users className="size-3.5" />
                                <span>{attendees.join(', ')}</span>
                              </div>
                            ) : null}
                          </div>

                          <div className="ml-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(event);
                              }}
                              className="rounded p-1 text-zinc-400 hover:text-white"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="rounded p-1 text-zinc-400 hover:text-red-400"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FLOATING BOTTOM BAR (Signature iOS calendar pill buttons) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex items-center justify-between px-4 sm:px-6">
              {/* Bottom Left: "Today" pill button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(TODAY);
                }}
                className="pointer-events-auto rounded-full border border-white/10 bg-[#1c1c1e]/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-[#2c2c2e] active:scale-95 sm:text-sm"
              >
                Today
              </button>

              {/* Bottom Right: Pill group with Calendar & Inbox icons */}
              <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-[#1c1c1e]/90 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setViewMode((m) => (m === 'timeline' ? 'agenda' : 'timeline'))}
                  title="Toggle calendar view"
                  className="rounded-full p-1 text-zinc-300 transition hover:text-white"
                >
                  <CalendarDays className="size-4" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowInboxDrawer((prev) => !prev)}
                    title="Upcoming deadlines & invitations"
                    className="rounded-full p-1 text-zinc-300 transition hover:text-white"
                  >
                    <Inbox className="size-4" />
                  </button>
                  {upcomingDeadlines.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                      {upcomingDeadlines.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Inbox / Deadlines Tray */}
            {showInboxDrawer && (
              <div className="absolute inset-x-0 bottom-16 z-50 animate-in fade-in slide-in-from-bottom-2 p-4">
                <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-[#1c1c1e]/95 p-4 shadow-2xl backdrop-blur-lg">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Inbox className="size-4 text-red-400" />
                      <h4 className="text-xs font-bold text-white">Upcoming Deadlines & Actions</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInboxDrawer(false)}
                      className="rounded p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2.5 max-h-48 space-y-2 overflow-y-auto">
                    {upcomingDeadlines.length === 0 ? (
                      <p className="py-2 text-center text-xs text-zinc-500">No pending deadlines.</p>
                    ) : (
                      upcomingDeadlines.map((dl) => (
                        <div
                          key={dl.id}
                          onClick={() => {
                            setSelectedDate(toISODate(dl.date));
                            setSelectedEventId(String(dl.id));
                            setShowInboxDrawer(false);
                          }}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-red-900/30 bg-red-950/20 p-2 transition hover:bg-red-950/40"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate text-xs font-bold text-red-200">{dl.title}</p>
                            <p className="text-[10px] text-zinc-400">
                              {toISODate(dl.date)} · {formatTime24h(dl.startTime)}
                            </p>
                          </div>
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                            Due
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMPANION SIDEBAR (Responsive Desktop/Tablet productivity details) */}
        <aside className="space-y-6 lg:col-span-4 xl:col-span-4">
          {/* Card 1: Selected Event Details & Fast Actions */}
          <div className="panel border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Event Details</h4>
                <p className="text-xs text-slate-500">Selected calendar item</p>
              </div>
              {selectedEvent && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                    selectedEvent.type === 'Meeting'
                      ? 'bg-cyan-100 text-cyan-800'
                      : selectedEvent.type === 'Deadline'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {selectedEvent.type}
                </span>
              )}
            </div>

            {selectedEvent ? (
              <div className="mt-4 space-y-3.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedEvent.title}</h3>
                  {selectedEvent.description && (
                    <p className="mt-1 text-xs text-slate-600">{selectedEvent.description}</p>
                  )}
                </div>

                <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-slate-500" />
                    <span>
                      {formatTime24h(selectedEvent.startTime)} – {formatTime24h(selectedEvent.endTime)} ({formatTime12h(selectedEvent.startTime)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-slate-500" />
                    <span>{formatIPhoneBannerDate(toISODate(selectedEvent.date))}</span>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-slate-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>

                {/* Attendees */}
                {parseAttendees(selectedEvent.attendees).length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Attendees ({parseAttendees(selectedEvent.attendees).length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {parseAttendees(selectedEvent.attendees).map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs"
                        >
                          <span className="flex size-4 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600">
                            {getInitials(name)}
                          </span>
                          <span>{name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedEvent)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    title="Remove event"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400 italic">
                Select an event from the timeline to inspect its full details.
              </p>
            )}
          </div>

          {/* Card 2: Day Metrics & Agenda Summary */}
          <div className="panel border border-slate-100 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Day Breakdown</h4>
            <p className="text-xs text-slate-500">{formatIPhoneBannerDate(selectedDate)}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-cyan-50 p-2.5">
                <p className="text-lg font-bold text-cyan-800">{meetingCount}</p>
                <p className="text-[10px] font-semibold text-cyan-700">Meetings</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <p className="text-lg font-bold text-emerald-800">{focusHours}h</p>
                <p className="text-[10px] font-semibold text-emerald-700">Focus</p>
              </div>
              <div className="rounded-xl bg-red-50 p-2.5">
                <p className="text-lg font-bold text-red-800">{deadlineCount}</p>
                <p className="text-[10px] font-semibold text-red-700">Deadlines</p>
              </div>
            </div>

            {/* Quick Filter tabs */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-500">Filter type:</span>
              <div className="flex items-center gap-1">
                {(['All', 'Meeting', 'Deadline', 'Focus'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                      filter === f
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </TaskflowShell>
  );
}

export default SchedulePage;
