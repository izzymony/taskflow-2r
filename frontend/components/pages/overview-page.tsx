'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlarmClock,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDot,
  Clock3,
  ListChecks,
  Plus,
  Timer,
  Users,
} from 'lucide-react';

import { PageHeader, TaskflowShell } from '../taskflow-shell';
import { TaskStatusMenu } from '@/components/task-status-menu';
import { TaskKanbanBoard } from '@/components/task-kanban-board';
import { TaskEditDialog } from '@/components/task-edit-dialog';
import {
  EmptyState,
  Field,
  FormShell,
  PageError,
  PageLoading,
  StatCard,
  inputClass,
  selectClass,
} from '@/components/ui/page-kit';
import { useProfile } from '@/hooks/use-profile';
import { useTaskStatus } from '@/hooks/use-task-status';
import { createTask, listTasks, updateTask, deleteTask } from '@/lib/api/tasks';
import { TASK_STATUS_TONE } from '@/lib/task-status';
import { cn } from '@/lib/utils';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type BoardTask,
  type IActivityEntry,
  type ICreateTaskInput,
  type ITask,
  type PagePreviewState,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/types';

const priorityTone: Record<TaskPriority, string> = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
  Critical: 'priority-critical',
};

/** Today in UTC so the server and the client always agree on "today". */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic date label — rendered the same on the server and the client. */
function formatDate(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function dueLabel(dueDate: string | null, today: string) {
  if (!dueDate) return 'No due date';
  const day = dueDate.slice(0, 10);
  if (day === today) return 'Due today';
  if (day < today) return `Overdue · ${formatDate(dueDate)}`;
  return `Due ${formatDate(dueDate)}`;
}

interface OverviewPageProps {
  preview?: PagePreviewState;
}

export function OverviewPage({ preview }: OverviewPageProps) {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const tasksQuery = useQuery<ITask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await listTasks();
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to fetch tasks');
      }
      return response.data;
    },
  });

  const [localActivity, setLocalActivity] = useState<IActivityEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Todo' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    due_date: '',
    tags: '',
    assignedTo: '',
  });

  const createMutation = useMutation({
    mutationFn: (input: ICreateTaskInput) => createTask(input),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        setFormError(response.message ?? 'Failed to create the task');
        return;
      }

      const created = response.data;
      queryClient.setQueryData<ITask[]>(['tasks'], (current) =>
        current ? [created, ...current] : [created],
      );
      setLocalActivity((current) => [
        {
          id: `activity-${Date.now()}`,
          actor: 'You',
          action: 'created the task',
          target: created.title,
          time: 'Just now',
        },
        ...current,
      ]);
      resetForm();
      setIsAdding(false);
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'Failed to create the task');
    },
  });

  const statusMutation = useTaskStatus();

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: ITask['id']; input: ICreateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<ITask[]>(['tasks']);
      queryClient.setQueryData<ITask[]>(['tasks'], (cached) =>
        cached?.map((task) =>
          task.id === id ? { ...task, ...input, updated_at: new Date().toISOString() } : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: ITask['id']) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditOpen(false);
      setEditingTask(null);
    },
  });

  const tasks = tasksQuery.data ?? [];
  const today = todayKey();

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'Completed');
    return {
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      completed: completed.length,
      overdue: tasks.filter(
        (task) => task.status !== 'Completed' && task.due_date && task.due_date.slice(0, 10) < today,
      ).length,
    };
  }, [tasks, today]);

  const openTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'Completed')
        .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')),
    [tasks],
  );

  const deadlines = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'Completed' && task.due_date)
        .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
        .slice(0, 4),
    [tasks],
  );

  const activity = useMemo(() => {
    const fromTasks = tasks.map((task) => ({
      id: `task-${task.id}`,
      actor: task.creatorName ?? 'A teammate',
      action: 'created the task',
      target: task.title,
      time: formatDate(task.created_at),
    }));
    return [...localActivity, ...fromTasks].slice(0, 8);
  }, [localActivity, tasks]);

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  function resetForm() {
    setForm({
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      due_date: '',
      tags: '',
      assignedTo: '',
    });
    setFormError(null);
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || createMutation.isPending) return;

    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      due_date: form.due_date ? `${form.due_date}T09:00:00` : null,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
    });
  }

  function applyStatus(task: ITask, status: TaskStatus) {
    setStatusError(null);
    statusMutation.mutate(
      { id: task.id, status },
      {
        onSuccess: (updated) => {
          setLocalActivity((current) => [
            {
              id: `activity-${Date.now()}`,
              actor: 'You',
              action: status === 'Completed' ? 'completed' : `moved to ${status}`,
              target: updated.title,
              time: 'Just now',
            },
            ...current,
          ]);
        },
        onError: (error) => {
          setStatusError(error instanceof Error ? error.message : 'Failed to update the task status');
        },
      },
    );
  }

  function toggleTask(task: ITask) {
    applyStatus(task, task.status === 'Completed' ? 'Todo' : 'Completed');
  }

  function handleStatusChange(task: BoardTask, status: TaskStatus) {
    setStatusError(null);
    statusMutation.mutate(
      { id: task.id, status },
      {
        onError: (error) => {
          setStatusError(error instanceof Error ? error.message : 'Failed to update the task status');
        },
      },
    );
  }

  function handleEditSubmit(input: ICreateTaskInput) {
    if (!editingTask) return;
    setEditError(null);
    editMutation.mutate({ id: editingTask.id, input }, {
      onError: (error) => {
        setEditError(error instanceof Error ? error.message : 'Failed to update the task');
      },
    });
  }

  function handleEdit(task: BoardTask) {
    setEditingTask(task);
    setEditOpen(true);
  }

  function handleDelete(task: BoardTask) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setEditError(null);
    deleteMutation.mutate(task.id);
  }

  const showLoading =
    preview === 'loading' ||
    (preview !== 'error' && preview !== 'empty' && tasksQuery.isPending);
  const showError =
    preview === 'error' ||
    (preview !== 'loading' && preview !== 'empty' && tasksQuery.isError);

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="OVERVIEW"
        title="Your work, simplified."
        description="Here’s what’s happening across your workspace today."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Plus className="size-[18px]" />
            Add new task
          </button>
        }
      />

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Add new task"
            description="The task is saved to your workspace and assigned to you by default."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddTask}
            submitLabel="Create task"
            isSubmitting={createMutation.isPending}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Task title" htmlFor="overview-title" className="sm:col-span-2">
                <input
                  id="overview-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="What needs to be done?"
                  className={inputClass}
                />
              </Field>
              <Field label="Description" htmlFor="overview-description" className="sm:col-span-2">
                <textarea
                  id="overview-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Add context, acceptance criteria or links."
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Status" htmlFor="overview-status">
                <select
                  id="overview-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as TaskStatus,
                    }))
                  }
                  className={selectClass}
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority" htmlFor="overview-priority">
                <select
                  id="overview-priority"
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as TaskPriority,
                    }))
                  }
                  className={selectClass}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Due date" htmlFor="overview-due">
                <input
                  id="overview-due"
                  type="date"
                  value={form.due_date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, due_date: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Assign to" htmlFor="overview-assignee">
                <select
                  id="overview-assignee"
                  value={form.assignedTo}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, assignedTo: event.target.value }))
                  }
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  {profile?.id ? <option value={String(profile.id)}>Me ({profile.fullname})</option> : null}
                </select>
              </Field>
              <Field
                label="Tags"
                htmlFor="overview-tags"
                hint="Separate tags with commas"
                className="sm:col-span-2"
              >
                <input
                  id="overview-tags"
                  value={form.tags}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="Backend, Bug"
                  className={inputClass}
                />
              </Field>
            </div>

            {formError ? (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-xs font-medium text-[#ff646b]"
              >
                {formError}
              </p>
            ) : null}
          </FormShell>
        </div>
      ) : null}

      {showLoading ? (
        <PageLoading label="Loading your workspace…" rows={5} />
      ) : showError ? (
        <PageError
          message={
            tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : 'We could not load your workspace.'
          }
          onRetry={() => tasksQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard
              label="Total tasks"
              value={stats.total}
              hint="Everything in your workspace"
              icon={ListChecks}
              tone="blue"
            />
            <StatCard
              label="In progress"
              value={stats.inProgress}
              hint="Being worked on right now"
              icon={Clock3}
              tone="amber"
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              hint={`${completionRate}% of all tasks`}
              icon={CheckCircle2}
              tone="green"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue}
              hint="Past the due date"
              icon={AlarmClock}
              tone="coral"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className="panel lg:col-span-2">
              <div className="panel-heading">
                <div>
                  <h2 className="section-title">Your tasks</h2>
                  <p className="section-subtitle">
                    {tasks.length} total · {stats.completed} completed
                  </p>
                </div>
                <span className="status-pill status-blue">{tasks.length} tasks</span>
              </div>

              {statusError ? (
                <p
                  role="alert"
                  className="mb-3 rounded-xl bg-[#fff0f0] px-4 py-3 text-xs font-medium text-[#ff646b]"
                >
                  {statusError}
                </p>
              ) : null}

              {editError ? (
                <p
                  role="alert"
                  className="mb-3 rounded-xl bg-[#fff0f0] px-4 py-3 text-xs font-medium text-[#ff646b]"
                >
                  {editError}
                </p>
              ) : null}

              {tasks.length === 0 || preview === 'empty' ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Nothing left to do"
                  description="Every task is completed. Add a new one or enjoy the quiet — it will not last."
                  action={
                    <button
                      type="button"
                      onClick={() => setIsAdding(true)}
                      className="soft-button"
                    >
                      <Plus className="size-3.5" /> Add a task
                    </button>
                  }
                />
              ) : (
                <TaskKanbanBoard
                  tasks={tasks}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isPending={
                    statusMutation.isPending ||
                    editMutation.isPending ||
                    deleteMutation.isPending
                  }
                />
              )}
            </section>

            <div className="space-y-6">
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2 className="section-title">Upcoming deadlines</h2>
                    <p className="section-subtitle">Next due dates</p>
                  </div>
                </div>

                {deadlines.length === 0 || preview === 'empty' ? (
                  <EmptyState
                    icon={CalendarClock}
                    title="No deadlines"
                    description="Nothing is scheduled to be delivered in the coming days."
                  />
                ) : (
                  <div className="space-y-3">
                    {deadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#edf0f5] p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#172033]">
                            {deadline.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#8b96a9]">
                            {dueLabel(deadline.due_date, today)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'priority-pill shrink-0',
                            priorityTone[deadline.priority],
                          )}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2 className="section-title">This week</h2>
                    <p className="section-subtitle">Completion progress</p>
                  </div>
                  <span className="text-2xl font-bold tracking-[-0.02em] text-[#172033]">
                    {completionRate}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0f5]">
                  <div
                    className="h-full rounded-full bg-[#ff646b] transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#172033]">{stats.completed}</p>
                    <p className="text-[11px] text-[#8b96a9]">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#172033]">{openTasks.length}</p>
                    <p className="text-[11px] text-[#8b96a9]">Remaining</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#172033]">{stats.overdue}</p>
                    <p className="text-[11px] text-[#8b96a9]">Overdue</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="panel lg:col-span-3">
              <div className="panel-heading">
                <div>
                  <h2 className="section-title">Recent activity</h2>
                  <p className="section-subtitle">Latest changes across your workspace</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b96a9]">
                  <Timer className="size-3.5" />
                  {tasks.length} tasks tracked
                </span>
              </div>

              {activity.length === 0 || preview === 'empty' ? (
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="Actions taken by your team will show up here as they happen."
                />
              ) : (
                <ol className="space-y-4">
                  {activity.map((entry, index) => (
                    <li key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'mt-1 size-2.5 shrink-0 rounded-full ring-4',
                            index === 0
                              ? 'bg-[#ff646b] ring-[#fff0f0]'
                              : 'bg-[#4e7cff] ring-[#edf3ff]',
                          )}
                        />
                        {index < activity.length - 1 ? (
                          <span className="mt-1 w-px flex-1 bg-[#edf0f5]" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-sm text-[#566176]">
                          <span className="font-semibold text-[#172033]">{entry.actor}</span>{' '}
                          {entry.action}{' '}
                          <span className="font-medium text-[#172033]">{entry.target}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#aeb9cc]">{entry.time}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}

      {editingTask ? (
        <TaskEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          task={editingTask}
          onSave={handleEditSubmit}
          isPending={editMutation.isPending}
          errorMessage={editError}
        />
      ) : null}
    </TaskflowShell>
  );
}

export default OverviewPage;
