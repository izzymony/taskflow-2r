'use client';

import { Menu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';

import { TASK_STATUS_DOT, TASK_STATUS_TONE, nextStatuses } from '@/lib/task-status';
import { cn } from '@/lib/utils';
import type { ITask, TaskStatus } from '@/lib/types';

export function TaskStatusMenu({
  task,
  onMove,
  disabled = false,
}: {
  task: Pick<ITask, 'id' | 'title' | 'status'>;
  onMove: (status: TaskStatus) => void;
  disabled?: boolean;
}) {
  const targets = nextStatuses(task.status);

  if (!targets.length) {
    return (
      <span className={cn('status-pill', TASK_STATUS_TONE[task.status])}>{task.status}</span>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={disabled}
        aria-label={`Change status of ${task.title}`}
        className={cn(
          'status-pill inline-flex items-center gap-1 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60',
          TASK_STATUS_TONE[task.status],
        )}
      >
        {task.status}
        <ChevronDown className="size-3" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" className="z-50">
          <Menu.Popup className="min-w-[184px] rounded-xl border border-[#edf0f5] bg-white p-1 shadow-[0_16px_40px_rgba(26,44,75,0.14)]">
            <Menu.Group>
              <Menu.GroupLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#a3adbc]">
                Move to
              </Menu.GroupLabel>
              {targets.map((status) => (
                <Menu.Item
                  key={status}
                  onClick={() => onMove(status)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#566176] outline-none transition data-[highlighted]:bg-[#f6f8fc] data-[highlighted]:text-[#172033]"
                >
                  <span className={cn('size-2 shrink-0 rounded-full', TASK_STATUS_DOT[status])} />
                  {status}
                </Menu.Item>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export default TaskStatusMenu;
