import type { TaskStatus } from '@/lib/types';

/**
 * Allowed status moves, per current status.
 *
 * The API enforces the same rules — this map only drives the UI so a user is
 * never offered a move the server would reject.
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  Todo: ['In Progress', 'Under Review', 'Completed'],
  'In Progress': ['Under Review', 'Completed', 'Todo'],
  'Under Review': ['In Progress', 'Completed', 'Todo'],
  Completed: ['In Progress', 'Todo'],
};

/** Pill classes for each status — shared so every surface looks the same. */
export const TASK_STATUS_TONE: Record<TaskStatus, string> = {
  Todo: 'status-blue',
  'In Progress': 'status-amber',
  'Under Review': 'status-purple',
  Completed: 'status-green',
};

/** Dot colour for the status marker inside the move menu. */
export const TASK_STATUS_DOT: Record<TaskStatus, string> = {
  Todo: 'bg-[#4e7cff]',
  'In Progress': 'bg-[#d98a12]',
  'Under Review': 'bg-[#7d5cf0]',
  Completed: 'bg-[#25a66a]',
};

/** The statuses a task can move to from its current one. */
export function nextStatuses(status: TaskStatus): TaskStatus[] {
  return TASK_STATUS_TRANSITIONS[status] ?? [];
}

/** Whether a transition is allowed. Staying in the same status is always fine. */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return from === to || nextStatuses(from).includes(to);
}
