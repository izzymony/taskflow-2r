'use client';

import { useCallback, useMemo } from 'react';
import { ArrowRight, CalendarClock, CircleDot, MoreHorizontal, Users } from 'lucide-react';

import {
  TASK_STATUSES,
  type TaskStatus,
  type IClientTask,
  type ITask,
} from '@/lib/types';
import { nextStatuses, TASK_STATUS_DOT, TASK_STATUS_TONE } from '@/lib/task-status';
import { TaskStatusMenu } from '@/components/task-status-menu';
import { cn } from '@/lib/utils';

type BoardTask = ITask | IClientTask;

interface TaskKanbanBoardProps {
  tasks: BoardTask[];
  onStatusChange: (task: BoardTask, status: TaskStatus) => void;
  onEdit: (task: BoardTask) => void;
  onDelete: (task: BoardTask) => void;
  isPending: boolean;
}

export function TaskKanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  isPending,
}: TaskKanbanBoardProps) {
  const columns = useMemo(
    () =>
      TASK_STATUSES.map((status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status),
      })),
    [tasks],
  );

  const handleMoveToNext = useCallback(
    (task: BoardTask) => {
      const targets = nextStatuses(task.status);
      if (!targets.length) return;
      onStatusChange(task, targets[0]);
    },
    [onStatusChange],
  );

  const isOverdue = (dueDate: string | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10);
  };

  return (
    <div role="board" aria-label="Task status board" className="flex flex-col md:flex-row lg:flex-nowrap gap-4 overflow-x-auto lg:overflow-x-auto">
      {columns.map((column) => (
          <section
            key={column.status}
            className="shrink-0 min-w-[280px] max-w-[360px] flex flex-col rounded-2xl border border-[#edf0f5] bg-white shadow-sm"
          >
          <div className="flex items-center justify-between rounded-t-xl border-b border-[#e5e9f1] bg-[#f8fafc] px-4 py-3">
            <div>
              <h3 className={cn('flex items-center gap-1.5 font-bold text-sm tracking-tight uppercase tracking-wider text-[10px]', TASK_STATUS_TONE[column.status])}>
                <span className="size-2 shrink-0 rounded-full" />
                {column.status}
              </h3>
              <p className="mt-0.5 text-[10px] font-medium text-[#8b96a9]">
                {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
            {column.tasks.length > 0 && (
              <button
                type="button"
                aria-label={`Move all ${column.status} tasks to next status`}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e9f1] bg-white px-3 py-1.5 text-xs font-semibold text-[#566176] transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f8fc] hover:text-[#ff646b] hover:border-[#ffb9bb]"
                onClick={() => {
                  if (isPending) return;
                  const targets = nextStatuses(column.status);
                  if (!targets.length) return;
                  column.tasks.forEach((task) => onStatusChange(task, targets[0]));
                }}
              >
                <ArrowRight className="size-3.5" />
                Move all
              </button>
            )}
          </div>
          <div className="flex-1 min-h-[240px] flex flex-col p-3 space-y-2.5 overflow-y-auto">
            {column.tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-dashed border-[#e5e9f1] bg-[#f8fafc] text-[#a3adbc] mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </span>
                <p className="text-xs text-[#8b96a9]">No tasks</p>
              </div>
            ) : (
              column.tasks.map((task) => {
                const overdue = isOverdue(task.due_date);
                return (
                  <article
                    key={String(task.id)}
                    className={cn(
                      'relative group rounded-xl border border-[#edf0f5] bg-white p-3.5 transition-all hover:border-[#ffb9bb] hover:shadow-md',
                      task.status === 'Completed' && 'bg-[#f8fafc]/50',
                    )}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(task);
                      }}
                      aria-label={`Edit ${task.title}`}
                      className="absolute top-2 right-2 rounded-lg p-1 text-[#a3adbc] transition opacity-0 group-hover:opacity-100 hover:bg-[#f6f8fc] hover:text-[#ff646b]"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <h4
                          className={cn(
                            'font-semibold text-[#172033] leading-snug',
                            task.status === 'Completed' && 'line-through text-[#8b96a9]',
                          )}
                        >
                          {task.title}
                        </h4>
                        {task.description ? (
                          <p
                            className={cn(
                              'mt-1 line-clamp-1 text-sm text-[#7f8a9e]',
                              task.status === 'Completed' && 'text-[#a3adbc]',
                            )}
                          >
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                      <span className={cn('size-2 shrink-0 rounded-full', TASK_STATUS_DOT[task.status])} />
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <TaskStatusMenu
                        task={task as { id: string | number; title: string; status: TaskStatus }}
                        disabled={isPending}
                        onMove={(status) => onStatusChange(task, status)}
                      />
                      <button
                        type="button"
                        aria-label={`Move ${task.title} to next status`}
                        disabled={isPending || nextStatuses(task.status).length === 0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMoveToNext(task);
                        }}
                        className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#e5e9f1] bg-white text-[#566176] transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f8fc] hover:text-[#ff646b] hover:border-[#ffb9bb]"
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[#8b96a9]">
                      {task.creatorName ? (
                        <span className="flex items-center gap-1.5">
                          <CircleDot className="size-2.5 text-[#a3adbc]" />
                          {task.creatorName}
                        </span>
                      ) : null}
                      {task.due_date ? (
                        <span className={cn('flex items-center gap-1.5', overdue && 'text-[#ff646b] font-medium')}>
                          <CalendarClock className="size-3.5" />
                          {overdue ? 'Overdue' : new Date(task.due_date).toLocaleDateString()}
                        </span>
                      ) : null}
                      {'assignedTo' in task && task.assignedTo ? (
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          Assigned
                        </span>
                      ) : null}
                      {(task.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-chip bg-[#edf3ff] text-[#4e7cff] truncate max-w-[64px]">
                          {tag}
                        </span>
                      ))}
                      {(task.tags ?? []).length > 2 && (
                        <span className="text-[10px]">+{(task.tags ?? []).length - 2}</span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default TaskKanbanBoard;
