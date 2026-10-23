'use client';

import { useCallback } from 'react';
import { ArrowRight, MoreHorizontal } from 'lucide-react';

import {
  TASK_STATUSES,
  type TaskStatus,
  type ITask,
} from '@/lib/types';
import { nextStatuses, TASK_STATUS_TONE } from '@/lib/task-status';
import { TaskStatusMenu } from '@/components/task-status-menu';
import { cn } from '@/lib/utils';

interface TaskKanbanBoardProps {
  tasks: ITask[];
  onStatusChange: (task: ITask, status: TaskStatus) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  isPending: boolean;
}

const columnGap = 'gap-4';

export function TaskKanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  isPending,
}: TaskKanbanBoardProps) {
  const columns = TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));

  const handleMoveToNext = useCallback(
    (task: ITask) => {
      const targets = nextStatuses(task.status);
      if (!targets.length) return;
      onStatusChange(task, targets[0]);
    },
    [onStatusChange],
  );

  return (
    <div
      role="board"
      aria-label="Task status board"
      className={cn(columnGap, 'flex flex-col lg:flex-row')}
    >
      {columns.map((column) => (
        <section
          key={column.status}
          className="flex-1 min-w-[260px] flex flex-col rounded-2xl border border-[#edf0f5] bg-[#f6f8fc]"
        >
          <div className="flex items-center justify-between rounded-t-xl border-b border-[#e5e9f1] bg-white/60 px-4 py-3">
            <div>
              <h3 className={cn('font-bold text-sm tracking-tight', TASK_STATUS_TONE[column.status])}>
                {column.status}
              </h3>
              <p className="text-[10px] font-medium text-[#8b96a9]">
                {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Move all ${column.status} tasks to next status`}
              disabled={isPending || column.tasks.length === 0}
              className={cn(
                'rounded-lg p-1.5 text-[#8b96a9] transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f8fc] hover:text-[#172033]',
                isPending && 'opacity-60 cursor-not-allowed',
              )}
              onClick={() => {
                if (isPending || column.tasks.length === 0) return;
                const targets = nextStatuses(column.status);
                if (!targets.length) return;
                column.tasks.forEach((task) => onStatusChange(task, targets[0]));
              }}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="flex-1 min-h-[200px] flex flex-col p-3 space-y-2.5 overflow-y-auto">
            {column.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-xs text-[#a3adbc]">
                No tasks
              </div>
            ) : (
              column.tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-[#edf0f5] bg-white p-3.5 transition hover:border-[#ffb9bb]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[#172033] leading-snug">{task.title}</h4>
                      {task.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-[#7f8a9e]">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(task);
                      }}
                      aria-label={`Edit ${task.title}`}
                      className="rounded-lg p-1 text-[#8b96a9] transition hover:bg-[#f6f8fc] hover:text-[#ff646b]"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <TaskStatusMenu
                      task={task}
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
                      className={cn(
                        'ml-auto flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#e5e9f1] bg-white text-[#566176] transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f6f8fc] hover:text-[#ff646b]',
                        isPending && 'opacity-60 cursor-not-allowed',
                      )}
                    >
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[#8b96a9]">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="tag-chip bg-[#edf3ff] text-[#4e7cff] truncate max-w-[90px]"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-[10px]">+{task.tags.length - 3}</span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default TaskKanbanBoard;
