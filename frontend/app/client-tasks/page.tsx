'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus } from 'lucide-react';

import { TaskflowShell, PageHeader } from '@/components/taskflow-shell';
import { TaskKanbanBoard } from '@/components/task-kanban-board';
import { TaskEditDialog } from '@/components/task-edit-dialog';
import { TaskFormDialog } from '@/components/task-form-dialog';
import { cn } from '@/lib/utils';
import type { IClient, ITask, TaskStatus } from '@/lib/types';
import { listClientTasks, createTask, createClientTask, updateTask, deleteTask } from '@/lib/api/tasks';
import { clients } from '@/lib/api/clients';
import type { ApiResponse } from '@/lib/types/api';

export default function ClientTasksPage() {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientsQuery = useQuery<ApiResponse<IClient[]>>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clients.list();
      if (!response.success) throw new Error(response.message ?? 'Failed to load clients');
      return response;
    },
  });

  const clientsList: IClient[] = (clientsQuery.data?.data ?? []).filter(
    (client) => !!client.userId,
  );

  const { data: tasks = [], isPending, refetch } = useQuery<ITask[]>({
    queryKey: ['client-tasks', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const response = await listClientTasks(selectedClient.id);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to fetch client tasks');
      }
      return response.data;
    },
    enabled: !!selectedClient,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: ITask['id']; status: TaskStatus }) =>
      updateTask(id, { status }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks', selectedClient?.id] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: ITask['id']; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['client-tasks', selectedClient?.id] });
      const previous = queryClient.getQueryData<ITask[]>([
        'client-tasks',
        selectedClient?.id,
      ]);
      queryClient.setQueryData<ITask[]>(['client-tasks', selectedClient?.id], (cached) =>
        cached?.map((task) =>
          task.id === id ? { ...task, ...input, updated_at: new Date().toISOString() } : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['client-tasks', selectedClient?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks', selectedClient?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: ITask['id']) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks', selectedClient?.id] });
      setEditOpen(false);
      setEditingTask(null);
    },
  });

  const handleSelectClient = (client: IClient) => {
    setSelectedClient(client);
    setError(null);
  };

  const handleStatusChange = useCallback(
    (task: ITask, status: TaskStatus) => {
      setError(null);
      statusMutation.mutate({ id: task.id, status });
    },
    [statusMutation],
  );

  const handleCreateClient = async (input: { name: string; email: string }) => {
    setError(null);
    try {
      const response = await clients.create({
        id: `client-${Date.now()}`,
        title: input.name,
        userId: '',
        company: input.name,
        contactName: '',
        email: input.email,
        phone: '',
      });
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to create client');
      }
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(response.data as unknown as IClient);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  const handleCreateTask = async (input: Parameters<typeof createTask>[0]) => {
    setError(null);
    try {
      const response = await createClientTask(input as Parameters<typeof createClientTask>[0]);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to create task');
      }
      refetch();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleEdit = (task: ITask) => {
    setEditingTask(task);
    setEditOpen(true);
  };

  const handleDelete = (task: ITask) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setError(null);
    deleteMutation.mutate(task.id);
  };

  const handleEditSave = (input: Parameters<typeof updateTask>[1]) => {
    if (!editingTask) return;
    setError(null);
    editMutation.mutate({ id: editingTask.id, input }, {
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to update the task');
      },
    });
  };

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="CLIENT TASKS"
        title="Client Tasks"
        description="Tasks tied to your clients and their projects."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="primary-button"
            disabled={!selectedClient}
          >
            <Plus className="size-[18px]" /> Add task
          </button>
        }
      />

      <section className="panel mt-6">
        <div className="panel-heading flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title">
              {selectedClient ? selectedClient.company : 'Select a client'}
            </h2>
            <p className="section-subtitle">
              Kanban board for client-scoped tasks. Personal tasks stay on the Tasks page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#172033]">Client</label>
            <select
              value={selectedClient?.id ?? ''}
              onChange={(event) => {
                const client = clientsList.find((c) => c.id === event.target.value);
                if (client) handleSelectClient(client);
              }}
              className="w-[220px] rounded-xl border border-[#e5e9f1] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10"
            >
              <option value="">Choose a client…</option>
              {clientsList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
            {error ? (
              <span className="text-xs font-medium text-[#ff646b]">{error}</span>
            ) : null}
          </div>
        </div>
      </section>

      {!selectedClient ? (
        <section className="panel mt-6 flex flex-col items-center justify-center py-24 text-center">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-[#4e7cff] mb-3">
            <ChevronRight className="size-6" />
          </span>
          <h3 className="text-base font-semibold text-[#172033]">
            Select a client to view their tasks
          </h3>
          <p className="mt-1 text-sm text-[#7f8a9e]">
            Client tasks are kept separate from your personal tasks on the Tasks page.
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setOpen(true)} className="primary-button">
              <Plus className="size-4" /> Add new client
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="panel mt-6">
            <div className="panel-heading flex items-center justify-between">
              <div>
                <h2 className="section-title">Task board</h2>
                <p className="section-subtitle">
                  Click the arrow on a card to move it to the next status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#8b96a9]">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <TaskKanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isPending={isPending || statusMutation.isPending || editMutation.isPending}
            />
          </section>
        </>
      )}

      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreateTask}
        isPending={isPending}
        errorMessage={error}
        members={[]}
        clientId={selectedClient?.id ?? null}
        title={selectedClient ? `New task for ${selectedClient.company}` : 'Add new client'}
      />

      {editingTask ? (
        <TaskEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          task={editingTask}
          onSave={handleEditSave}
          isPending={editMutation.isPending}
          errorMessage={error}
        />
      ) : null}
    </TaskflowShell>
  );
}
