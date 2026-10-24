'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus } from 'lucide-react';

import { TaskflowShell, PageHeader } from '@/components/taskflow-shell';
import { TaskKanbanBoard } from '@/components/task-kanban-board';
import { TaskEditDialog } from '@/components/task-edit-dialog';
import { TaskFormDialog } from '@/components/task-form-dialog';
import { cn } from '@/lib/utils';
import type { BoardTask, IClient, IClientTask, ICreateClientTaskInput, ICreateTaskInput, IProject, TaskStatus } from '@/lib/types';
import {
  createClientTaskFromTable,
  deleteClientTaskFromTable,
  listClientTasksFromTable,
  updateClientTaskFromTable,
} from '@/lib/api/tasks';
import { clients, projects } from '@/lib/api/clients';
import type { ApiResponse } from '@/lib/types/api';

export default function ClientTasksPage() {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<IClientTask | null>(null);
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

  const { data: tasks = [], isPending, refetch } = useQuery<IClientTask[]>({
    queryKey: ['client-tasks', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const response = await listClientTasksFromTable(selectedClient.id);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to fetch client tasks');
      }
      return response.data;
    },
    enabled: !!selectedClient,
  });

  const { data: clientProjects = [] } = useQuery<ApiResponse<IProject[]>>({
    queryKey: ['client-projects', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return { success: true, data: [] };
      const response = await projects.list();
      if (!response.success) throw new Error(response.message ?? 'Failed to load projects');
      const allProjects = response.data ?? [];
      return {
        success: true,
        data: allProjects.filter((p) => p.clientId === selectedClient.id),
      };
    },
    enabled: !!selectedClient,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateClientTaskFromTable(id, { status }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks', selectedClient?.id] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateClientTaskFromTable>[1] }) =>
      updateClientTaskFromTable(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['client-tasks', selectedClient?.id] });
      const previous = queryClient.getQueryData<IClientTask[]>([
        'client-tasks',
        selectedClient?.id,
      ]);
      queryClient.setQueryData<IClientTask[]>(['client-tasks', selectedClient?.id], (cached) =>
        cached?.map((task) =>
          task.id === id ? { ...task, ...(input as Partial<IClientTask>) } : task,
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
    mutationFn: (id: string) => deleteClientTaskFromTable(id),
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
    (task: BoardTask, status: TaskStatus) => {
      setError(null);
      statusMutation.mutate({ id: String(task.id), status });
    },
    [statusMutation],
  );

  const [clientCreationOpen, setClientCreationOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const handleCreateClient = async () => {
    setError(null);
    if (!newClientName.trim()) {
      setError('Client name is required');
      return;
    }
    if (!newClientPhone.trim()) {
      setError('Phone is required');
      return;
    }
    if (newClientPhone.trim().length > 11) {
      setError('Phone must be at most 11 characters');
      return;
    }

    try {
      const response = await clients.create({
        id: `client-${Date.now()}`,
        title: newClientName.trim(),
        company: newClientName.trim(),
        contactName: '',
        email: '',
        phone: newClientPhone.trim(),
        status: 'Pending',
        plan: 'Growth',
        billingType: 'Hourly',
        rate: '0.00',
        currency: 'NGN',
      });
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to create client');
      }
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(response.data as unknown as IClient);
      setClientCreationOpen(false);
      setNewClientName('');
      setNewClientPhone('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  const handleCreateTask = async (input: ICreateTaskInput) => {
    setError(null);
    try {
      const clientTaskInput: ICreateClientTaskInput = {
        ...input,
        clientId: selectedClient!.id,
        projectId: input.projectId ?? '',
        assignedTo: input.assignedTo !== undefined && input.assignedTo !== null ? String(input.assignedTo) : input.assignedTo,
      };
      const response = await createClientTaskFromTable(clientTaskInput);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Failed to create task');
      }
      refetch();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleEdit = (task: BoardTask) => {
    setEditingTask(task as IClientTask);
    setEditOpen(true);
  };

  const handleDelete = (task: BoardTask) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setError(null);
    deleteMutation.mutate(String(task.id));
  };

  const handleEditSave = (input: ICreateTaskInput) => {
    if (!editingTask) return;
    setError(null);
    const mutationInput = input as Partial<ICreateClientTaskInput>;
    editMutation.mutate({ id: String(editingTask.id), input: mutationInput }, {
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
            <button type="button" onClick={() => setClientCreationOpen(true)} className="primary-button">
              <Plus className="size-4" /> Add new client
            </button>
          </div>
          {clientCreationOpen && (
            <div className="mt-8 w-full max-w-md flex flex-col gap-3">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Client company name"
                className="rounded-xl border border-[#e5e9f1] bg-white px-4 py-3 text-sm text-[#172033] outline-none focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10"
              />
              <input
                type="text"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="Phone (max 11 chars)"
                className="rounded-xl border border-[#e5e9f1] bg-white px-4 py-3 text-sm text-[#172033] outline-none focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10"
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateClient} className="primary-button flex-1">
                  Create client
                </button>
                <button type="button" onClick={() => setClientCreationOpen(false)} className="soft-button flex-1">
                  Cancel
                </button>
              </div>
            </div>
          )}
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

      {selectedClient && (
        <TaskFormDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={handleCreateTask}
          isPending={isPending}
          errorMessage={error}
          members={[]}
          clientId={selectedClient.id}
          projectId={undefined}
          projects={Array.isArray(clientProjects) ? clientProjects : (clientProjects.data ?? [])}
          title={`New task for ${selectedClient.company}`}
        />
      )}

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
