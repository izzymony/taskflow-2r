'use client'

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Dialog } from '@base-ui/react/dialog'
import { Plus, X } from 'lucide-react'

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type BoardTask,
  type ICreateTaskInput,
  type ITask,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/types'
import { createTask, listTasks, updateTask, deleteTask } from '@/lib/api/tasks'
import { cn } from '@/lib/utils'
import { PageHeader, TaskflowShell } from '@/components/taskflow-shell'
import { TaskEditDialog } from '@/components/task-edit-dialog'
import { TaskKanbanBoard } from '@/components/task-kanban-board'
import { useTaskStatus } from '@/hooks/use-task-status'

export interface ITaskMember {
  id: number
  name: string
}

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: ICreateTaskInput) => void
  isPending?: boolean
  errorMessage?: string | null
  /** Optional: people a task can be assigned to. Field is hidden when empty. */
  members?: ITaskMember[]
  /** When set, the created task is attached to this client (client-scoped task). */
  clientId?: string | null
}

interface FormState {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string // yyyy-mm-dd from <input type="date">
  tags: string[]
  assignedTo: string // '' = unassigned
}

const initialState: FormState = {
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
  tags: [],
  assignedTo: '',
}

const priorityColor: Record<TaskPriority, string> = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
  Critical: 'priority-critical',
}

const TITLE_MAX = 120
const DESCRIPTION_MAX = 1000
const TAGS_MAX = 8

const inputBase =
  'rounded-xl border border-[#e5e9f1] bg-white text-sm text-[#172033] outline-none placeholder:text-[#b6bfcd] focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10'

function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  errorMessage,
  members = [],
  clientId,
}: TaskFormDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#edf0f5] bg-white p-6 shadow-[0_24px_60px_rgba(26,44,75,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-[#172033]">
                Create new task
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[#8b96a9]">
                Add the details below. You will be recorded as the creator.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1 text-[#8b96a9] transition hover:bg-[#f6f8fc] hover:text-[#172033]">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Mounts fresh every time the popup opens, so state resets automatically */}
          <TaskForm
            onSubmit={onSubmit}
            isPending={isPending}
            errorMessage={errorMessage}
            members={members}
            clientId={clientId}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TaskForm({
  onSubmit,
  isPending,
  errorMessage,
  members,
  clientId,
}: {
  onSubmit: (input: ICreateTaskInput) => void
  isPending: boolean
  errorMessage?: string | null
  members: ITaskMember[]
  clientId?: string | null
}) {
  const [form, setForm] = useState<FormState>(initialState)
  const [tagInput, setTagInput] = useState('')
  const [touched, setTouched] = useState(false)

  const titleError = touched && !form.title.trim() ? 'Title is required.' : null

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addTag(raw: string) {
    const value = raw.trim()
    if (!value) return
    setForm((prev) => {
      const exists = prev.tags.some((tag) => tag.toLowerCase() === value.toLowerCase())
      if (exists || prev.tags.length >= TAGS_MAX) return prev
      return { ...prev, tags: [...prev.tags, value] }
    })
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }))
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(tagInput)
    } else if (event.key === 'Backspace' && !tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!form.title.trim()) return

    // Include a tag that was typed but not yet confirmed with Enter
    const pendingTag = tagInput.trim()
    const tags =
      pendingTag && !form.tags.some((t) => t.toLowerCase() === pendingTag.toLowerCase())
        ? [...form.tags, pendingTag].slice(0, TAGS_MAX)
        : form.tags

    const payload: ICreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      tags,
      due_date: form.dueDate ? new Date(`${form.dueDate}T09:00:00`).toISOString() : null,
      assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      ...(clientId ? { clientId } : {}),
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
      {/* Title */}
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
        <span className="flex items-center justify-between">
          <span>
            Title <span className="text-[#ff646b]">*</span>
          </span>
          <span className="font-medium text-[#b6bfcd]">
            {form.title.length}/{TITLE_MAX}
          </span>
        </span>
        <input
          value={form.title}
          maxLength={TITLE_MAX}
          onChange={(event) => patch('title', event.target.value)}
          placeholder="What needs to be done?"
          aria-invalid={Boolean(titleError)}
          className={cn(
            inputBase,
            'h-11 px-4',
            titleError && 'border-[#ff646b] ring-4 ring-[#ff646b]/10',
          )}
        />
        {titleError ? (
          <span className="text-[11px] font-medium text-[#ff646b]">{titleError}</span>
        ) : null}
      </label>

      {/* Description */}
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
        <span className="flex items-center justify-between">
          <span>Description</span>
          <span className="font-medium text-[#b6bfcd]">
            {form.description.length}/{DESCRIPTION_MAX}
          </span>
        </span>
        <textarea
          rows={3}
          value={form.description}
          maxLength={DESCRIPTION_MAX}
          onChange={(event) => patch('description', event.target.value)}
          placeholder="Add context, acceptance criteria or links."
          className={cn(inputBase, 'resize-none px-4 py-3')}
        />
      </label>

      {/* Status + Priority */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
          Status
          <select
            value={form.status}
            onChange={(event) => patch('status', event.target.value as TaskStatus)}
            className={cn(inputBase, 'h-11 px-3')}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
          Priority
          <select
            value={form.priority}
            onChange={(event) => patch('priority', event.target.value as TaskPriority)}
            className={cn(inputBase, 'h-11 px-3')}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Due date + Assignee */}
      <div className={cn('grid gap-4', members.length > 0 && 'sm:grid-cols-2')}>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
          Due date
          <input
            type="date"
            min={todayISO()}
            value={form.dueDate}
            onChange={(event) => patch('dueDate', event.target.value)}
            className={cn(inputBase, 'h-11 px-3')}
          />
        </label>

        {members.length > 0 ? (
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
            Assign to
            <select
              value={form.assignedTo}
              onChange={(event) => patch('assignedTo', event.target.value)}
              className={cn(inputBase, 'h-11 px-3')}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5 text-xs font-semibold text-[#172033]">
        <label htmlFor="task-tags">Tags</label>
        <div
          className={cn(
            inputBase,
            'flex min-h-11 flex-wrap items-center gap-1.5 px-3 py-2 focus-within:border-[#ff646b] focus-within:ring-4 focus-within:ring-[#ff646b]/10',
          )}
        >
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#edf3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4e7cff]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className="rounded-full text-[#4e7cff]/70 transition hover:text-[#ff646b]"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            id="task-tags"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={form.tags.length >= TAGS_MAX}
            placeholder={form.tags.length ? '' : 'Backend, Bug'}
            className="min-w-[96px] flex-1 border-0 bg-transparent text-sm font-normal outline-none placeholder:text-[#b6bfcd]"
          />
        </div>
        <span className="text-[11px] font-medium text-[#b6bfcd]">
          Press Enter or comma to add. Up to {TAGS_MAX} tags.
        </span>
      </div>

      {errorMessage ? (
        <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-xs font-medium text-[#ff646b]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-1">
        <Dialog.Close className="soft-button">Cancel</Dialog.Close>
        <button type="submit" disabled={isPending} className="primary-button disabled:opacity-60">
          {isPending ? 'Creating…' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

export default function Page() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ITask | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const statusMutation = useTaskStatus()

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: ITask['id']; input: ICreateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<ITask[]>(['tasks'])
      queryClient.setQueryData<ITask[]>(['tasks'], (cached) =>
        cached?.map((task) =>
          task.id === id ? { ...task, ...input, updated_at: new Date().toISOString() } : task,
        ),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: ITask['id']) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditOpen(false)
      setEditingTask(null)
    },
  })

  async function handleSubmit(input: ICreateTaskInput) {
    setIsPending(true)
    setErrorMessage(null)
    try {
      const response = await createTask(input)
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to create task')
      }
      const createdTask = response.data
      queryClient.setQueryData<ITask[]>(['tasks'], (current) =>
        current ? [createdTask, ...current] : [createdTask],
      )
      setOpen(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setIsPending(false)
    }
  }

  function handleEditSubmit(input: ICreateTaskInput) {
    if (!editingTask) return
    setEditError(null)
    editMutation.mutate({ id: editingTask.id, input }, {
      onError: (error) => {
        setEditError(error instanceof Error ? error.message : 'Failed to update the task')
      },
    })
  }

  function handleEdit(task: BoardTask) {
    setEditingTask(task as ITask)
    setEditOpen(true)
  }

  function handleDelete(task: BoardTask) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    deleteMutation.mutate(task.id)
  }

  const handleStatusChange = useCallback((task: BoardTask, status: TaskStatus) => {
    setStatusError(null)
    statusMutation.mutate(
      { id: task.id, status },
      {
        onError: (error) => {
          setStatusError(error instanceof Error ? error.message : 'Failed to update the task status')
        },
      },
    )
  }, [statusMutation])

  const tasksQuery = useQuery<ITask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await listTasks()
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to fetch tasks')
      }
      return response.data
    },
  })

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="TASKS"
        title="Tasks"
        description="Create and manage your tasks."
        action={
          <button onClick={() => setOpen(true)} className="primary-button">
            <Plus className="size-[18px]" /> Add new
          </button>
        }
      />
      <section className="panel mt-6">
        <div className="panel-heading">
          <div>
            <h2 className="section-title">All tasks</h2>
            <p className="section-subtitle">Tasks fetched from your workspace.</p>
          </div>
        </div>
        {statusError ? (
          <p role="alert" className="mt-3 text-sm text-[#ff646b]">
            {statusError}
          </p>
        ) : null}
        {editError ? (
          <p role="alert" className="mt-3 text-sm text-[#ff646b]">
            {editError}
          </p>
        ) : null}
        {tasksQuery.isPending ? (
          <p role="status" className="text-sm text-[#7f8a9e]">Loading tasks…</p>
        ) : tasksQuery.isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="alert" className="text-sm text-[#ff646b]">
              {tasksQuery.error.message}
            </p>
            <button type="button" onClick={() => tasksQuery.refetch()} className="soft-button">
              Try again
            </button>
          </div>
        ) : (
          <TaskKanbanBoard
            tasks={tasksQuery.data ?? []}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isPending={tasksQuery.isPending || statusMutation.isPending || editMutation.isPending || deleteMutation.isPending}
          />
        )}
      </section>
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isPending={isPending}
        errorMessage={errorMessage}
        members={[]}
      />
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
  )
}