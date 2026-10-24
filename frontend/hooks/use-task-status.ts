'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTask } from '@/lib/api/tasks';
import { canTransition } from '@/lib/task-status';
import type { ITask, TaskStatus } from '@/lib/types';

export interface TaskStatusChange {
  id: string | number;
  status: TaskStatus;
}

/**
 * Moves a task between statuses.
 *
 * The move is validated against the transition rules before it is sent, the
 * cache is updated optimistically so the pill reacts instantly, and the
 * previous snapshot is restored when the API rejects the move.
 */
export function useTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: TaskStatusChange) => {
      const response = await updateTask(id, { status });
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to update the task status');
      }

      return response.data;
    },

    onMutate: async ({ id, status }: TaskStatusChange) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previous = queryClient.getQueryData<ITask[]>(['tasks']);
      const current = previous?.find((task) => task.id === id);

      if (current && !canTransition(current.status, status)) {
        throw new Error(`A task cannot move from ${current.status} to ${status}.`);
      }

      queryClient.setQueryData<ITask[]>(['tasks'], (cached) =>
        cached?.map((task) =>
          task.id === id ? { ...task, status, updated_at: new Date().toISOString() } : task,
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
}
