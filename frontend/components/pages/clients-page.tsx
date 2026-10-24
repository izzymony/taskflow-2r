'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  Building2,
  Edit2,
  FolderKanban,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { Dialog } from '@base-ui/react/dialog';
import { PageHeader, TaskflowShell } from '../taskflow-shell';
import {
  EmptyState,
  Field,
  FilterTabs,
  FormShell,
  PageError,
  PageLoading,
  SearchInput,
  StatCard,
  ClientCard,
  Toast,
  inputClass,
  selectClass,
} from '@/components/ui/page-kit';
import { cn } from '@/lib/utils';
import type {
  BillingType,
  ClientPlan,
  ClientStatus,
  IClient,
  IProject,
  PagePreviewState,
} from '@/lib/types';
import { clients, projects } from '@/lib/api/clients';

const statusTone: Record<ClientStatus, string> = {
  Active: 'status-green',
  Pending: 'status-amber',
  Inactive: 'status-muted',
};

const planTone: Record<ClientPlan, string> = {
  Starter: 'status-muted',
  Growth: 'status-blue',
  Enterprise: 'status-purple',
};

type ClientFilter = 'All' | ClientStatus;

interface ClientsPageProps {
  preview?: PagePreviewState;
}

export function ClientsPage({ preview }: ClientsPageProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ClientFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message?: string } | null>(null);
  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    plan: 'Growth' as ClientPlan,
    status: 'Pending' as ClientStatus,
    billingType: 'Hourly' as BillingType,
    rate: '',
    currency: 'NGN',
    monthlyBudgetCap: null as number | null,
  });

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await clients.list();
      if (!response.success) throw new Error(response.message ?? 'Failed to load clients');
      return response.data ?? [];
    },
  });

  const clientsList: IClient[] = clientsQuery.data ?? [];

  const counts = useMemo(
    () => ({
      All: clientsList.length,
      Active: clientsList.filter((client) => client.status === 'Active').length,
      Pending: clientsList.filter((client) => client.status === 'Pending').length,
      Inactive: clientsList.filter((client) => client.status === 'Inactive').length,
    }),
    [clientsList],
  );

  const visibleClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return clientsList.filter((client) => {
      const matchesFilter = filter === 'All' || client.status === filter;
      const matchesQuery =
        !term ||
        client.company.toLowerCase().includes(term) ||
        client.contactName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [clientsList, filter, query]);

  const monthlyValue = useMemo(
    () => clientsList.reduce((total, client) => total + client.value, 0),
    [clientsList],
  );

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof clients.create>[0]) => clients.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAdding(false);
      setFilter('All');
      setQuery('');
      setForm({
        company: '',
        contactName: '',
        email: '',
        phone: '',
        plan: 'Growth' as ClientPlan,
        status: 'Pending' as ClientStatus,
        billingType: 'Hourly' as BillingType,
        rate: '',
        currency: 'NGN',
        monthlyBudgetCap: null,
      });
      setToast({ type: 'success', title: 'Client created', message: 'Your new client has been added successfully.' });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Parameters<typeof clients.update>[1]> }) =>
      clients.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditOpen(false);
      setToast({ type: 'success', title: 'Client updated', message: 'Client details have been saved.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clients.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setToast({ type: 'success', title: 'Client archived', message: 'The client has been removed.' });
    },
  });

  const projectCreateMutation = useMutation({
    mutationFn: (input: Parameters<typeof projects.create>[0]) => projects.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsAddingProject(false);
      setProjectForm({
        name: '',
        clientId: '',
        description: '',
        status: 'Active' as const,
        dueDate: '',
      });
      setToast({ type: 'success', title: 'Project created', message: 'New project has been added to the client.' });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    },
  });

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<{
    name: string;
    clientId: string;
    description: string;
    status: 'Active' | 'Paused' | 'Completed';
    dueDate: string;
  }>({
    name: '',
    clientId: '',
    description: '',
    status: 'Active',
    dueDate: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [editForm, setEditForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    plan: 'Growth' as ClientPlan,
    status: 'Active' as ClientStatus,
    billingType: 'Hourly' as BillingType,
    rate: '',
    currency: 'NGN',
    monthlyBudgetCap: null as number | null,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Parameters<typeof clients.update>[1]> }) =>
      clients.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditOpen(false);
      setEditingClient(null);
    },
  });

  function openEditClient(client: IClient) {
    setEditingClient(client);
    setEditForm({
      company: client.company,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone,
      plan: client.plan,
      status: client.status,
      billingType: client.billingType,
      rate: client.rate,
      currency: client.currency,
      monthlyBudgetCap: client.monthlyBudgetCap,
    });
    setEditOpen(true);
  }

  function handleAddClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.company.trim()) {
      setError('Company name is required');
      return;
    }
    if (!form.phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (form.phone.trim().length > 11) {
      setError('Phone must be at most 11 characters');
      return;
    }

    createMutation.mutate({
      id: `client-${Date.now()}`,
      title: form.company.trim(),
      company: form.company.trim(),
      contactName: form.contactName.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim(),
      status: form.status,
      plan: form.plan,
      billingType: form.billingType,
      rate: form.rate.trim() || '0.00',
      currency: form.currency.trim() || 'NGN',
      monthlyBudgetCap: form.monthlyBudgetCap ?? undefined,
    });
  }

  function handleAddProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectForm.name.trim() || !projectForm.clientId.trim()) return;

    projectCreateMutation.mutate({
      name: projectForm.name.trim(),
      clientId: projectForm.clientId.trim(),
      description: projectForm.description.trim() || undefined,
      status: projectForm.status,
      dueDate: projectForm.dueDate || undefined,
    });
  }

  function archiveClient(id: string) {
    updateMutation.mutate({ id, input: { status: 'Inactive' as ClientStatus } });
  }

  function deleteClient(id: string) {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    deleteMutation.mutate(id);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="RELATIONSHIPS"
        title="Clients"
        description="Keep client context, communication, and work together."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <UserPlus className="size-[18px]" />
            Add client
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-[#ff646b] bg-[#ff646b]/10 p-4 text-sm text-[#ff646b]">
          {error}
        </div>
      )}

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Add new client"
            description="New clients start as pending until the contract is signed."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddClient}
            submitLabel="Add client"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company" htmlFor="client-company">
                <input
                  id="client-company"
                  value={form.company}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, company: event.target.value }))
                  }
                  placeholder="Northstar Studio"
                  className={inputClass}
                />
              </Field>
              <Field label="Contact name" htmlFor="client-contact">
                <input
                  id="client-contact"
                  value={form.contactName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contactName: event.target.value }))
                  }
                  placeholder="Amanuel Tadesse"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="client-email">
                <input
                  id="client-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="name@company.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone" htmlFor="client-phone">
                <input
                  id="client-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </Field>
              <Field label="Plan" htmlFor="client-plan">
                <select
                  id="client-plan"
                  value={form.plan}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, plan: event.target.value as ClientPlan }))
                  }
                  className={selectClass}
                >
                  {(['Starter', 'Growth', 'Enterprise'] as ClientPlan[]).map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="client-status">
                <select
                  id="client-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as ClientStatus }))
                  }
                  className={selectClass}
                >
                  {(['Pending', 'Active', 'Inactive'] as ClientStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Billing type" htmlFor="client-billing-type">
                <select
                  id="client-billing-type"
                  value={form.billingType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      billingType: event.target.value as BillingType,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Hourly', 'Retainer', 'Fixed_Project'] as BillingType[]).map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rate" htmlFor="client-rate">
                <input
                  id="client-rate"
                  type="number"
                  value={form.rate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, rate: event.target.value }))
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
              <Field label="Currency" htmlFor="client-currency">
                <input
                  id="client-currency"
                  value={form.currency}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, currency: event.target.value }))
                  }
                  placeholder="NGN"
                  className={inputClass}
                />
              </Field>
              <Field label="Monthly budget cap" htmlFor="client-budget-cap">
                <input
                  id="client-budget-cap"
                  type="number"
                  value={form.monthlyBudgetCap ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      monthlyBudgetCap: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      {isAddingProject ? (
        <div className="mb-6">
          <FormShell
            title="Add new project"
            description="Projects belong to a client and group related tasks."
            onCancel={() => setIsAddingProject(false)}
            onSubmit={handleAddProject}
            submitLabel="Add project"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name" htmlFor="project-name">
                <input
                  id="project-name"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Website redesign"
                  className={inputClass}
                />
              </Field>
              <Field label="Client" htmlFor="project-client">
                <select
                  id="project-client"
                  value={projectForm.clientId}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, clientId: event.target.value }))
                  }
                  className={selectClass}
                >
                  <option value="">Choose a client…</option>
                  {clientsList.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="project-status">
                <select
                  id="project-status"
                  value={projectForm.status}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      status: event.target.value as 'Active' | 'Paused' | 'Completed',
                    }))
                  }
                  className={selectClass}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </Field>
              <Field label="Due date" htmlFor="project-due-date">
                <input
                  id="project-due-date"
                  type="date"
                  value={projectForm.dueDate}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Description" htmlFor="project-description">
                <textarea
                  id="project-description"
                  value={projectForm.description}
                  rows={2}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Project brief and objectives"
                  className="rounded-xl border border-[#e5e9f1] bg-white text-sm text-[#172033] outline-none placeholder:text-[#b6bfcd] focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10 resize-none px-4 py-3"
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total clients"
          value={counts.All}
          hint="Across 4 locations"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Active"
          value={counts.Active}
          hint="Working with you right now"
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="Pending onboarding"
          value={counts.Pending}
          hint="Contract not signed yet"
          icon={Building2}
          tone="amber"
        />
        <StatCard
          label="Monthly value"
          value={`$${monthlyValue.toLocaleString()}`}
          hint="Combined contract value"
          icon={FolderKanban}
          tone="purple"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">All clients</h2>
            <p className="section-subtitle">
              {visibleClients.length} of {clientsList.length} clients shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<ClientFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Active', label: 'Active', count: counts.Active },
                { value: 'Pending', label: 'Pending', count: counts.Pending },
                { value: 'Inactive', label: 'Inactive', count: counts.Inactive },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search clients…"
              className="sm:w-56"
            />
            <button
              type="button"
              onClick={() => setIsAddingProject(true)}
              className="primary-button"
            >
              <Plus className="size-[18px]" /> Add project
            </button>
          </div>
        </div>

        {clientsQuery.isPending ? (
          <PageLoading label="Loading clients…" rows={3} />
        ) : clientsQuery.isError ? (
          <PageError message={clientsQuery.error.message} onRetry={() => clientsQuery.refetch()} />
        ) : visibleClients.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={Building2}
            title={
              clientsList.length && preview !== 'empty'
                ? 'No clients match your filters'
                : 'No clients yet'
            }
            description={
              clientsList.length && preview !== 'empty'
                ? 'Try a different search term or switch the status filter to see more clients.'
                : 'Add your first client to keep contact details, projects and invoices in one place.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <UserPlus className="size-3.5" /> Add client
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={openEditClient}
                onArchive={archiveClient}
                onDelete={deleteClient}
              />
            ))}
          </div>
        )}
      </section>

      {editOpen && editingClient ? (
        <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#172033]/40 backdrop-blur-sm" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#edf0f5] bg-white p-6 shadow-[0_24px_60px_rgba(26,44,75,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-[#172033]">
                    Edit client
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-[#8b96a9]">
                    Update {editingClient.company} details.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="rounded-lg p-1 text-[#8b96a9] transition hover:bg-[#f6f8fc] hover:text-[#ff646b]">
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </Dialog.Close>
              </div>

              <FormShell
                title=""
                description=""
                onCancel={() => setEditOpen(false)}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (
                    !editForm.company.trim() ||
                    !editForm.contactName.trim() ||
                    !editForm.email.trim()
                  )
                    return;
                  editMutation.mutate({
                    id: editingClient.id,
                    input: {
                      company: editForm.company.trim(),
                      contactName: editForm.contactName.trim(),
                      email: editForm.email.trim(),
                      phone: editForm.phone.trim(),
                      plan: editForm.plan,
                      status: editForm.status,
                      billingType: editForm.billingType,
                      rate: editForm.rate,
                      currency: editForm.currency,
                      monthlyBudgetCap: editForm.monthlyBudgetCap ?? undefined,
                    },
                  });
                }}
                submitLabel="Save changes"
                isSubmitting={editMutation.isPending}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company" htmlFor="edit-client-company">
                    <input
                      id="edit-client-company"
                      value={editForm.company}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, company: event.target.value }))
                      }
                      placeholder="Northstar Studio"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Contact name" htmlFor="edit-client-contact">
                    <input
                      id="edit-client-contact"
                      value={editForm.contactName}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, contactName: event.target.value }))
                      }
                      placeholder="Amanuel Tadesse"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" htmlFor="edit-client-email">
                    <input
                      id="edit-client-email"
                      type="email"
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="name@company.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone" htmlFor="edit-client-phone">
                    <input
                      id="edit-client-phone"
                      value={editForm.phone}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="+1 (555) 000-0000"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Status" htmlFor="edit-client-status">
                    <select
                      id="edit-client-status"
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          status: event.target.value as ClientStatus,
                        }))
                      }
                      className={selectClass}
                    >
                      {(['Active', 'Pending', 'Inactive'] as ClientStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Plan" htmlFor="edit-client-plan">
                    <select
                      id="edit-client-plan"
                      value={editForm.plan}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, plan: event.target.value as ClientPlan }))
                      }
                      className={selectClass}
                    >
                      {(['Starter', 'Growth', 'Enterprise'] as ClientPlan[]).map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status" htmlFor="edit-client-status">
                    <select
                      id="edit-client-status"
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          status: event.target.value as ClientStatus,
                        }))
                      }
                      className={selectClass}
                    >
                      {(['Active', 'Pending', 'Inactive'] as ClientStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Billing type" htmlFor="edit-client-billing-type">
                    <select
                      id="edit-client-billing-type"
                      value={editForm.billingType}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          billingType: event.target.value as BillingType,
                        }))
                      }
                      className={selectClass}
                    >
                      {(['Hourly', 'Retainer', 'Fixed_Project'] as BillingType[]).map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Rate" htmlFor="edit-client-rate">
                    <input
                      id="edit-client-rate"
                      type="number"
                      value={editForm.rate}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, rate: event.target.value }))
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Currency" htmlFor="edit-client-currency">
                    <input
                      id="edit-client-currency"
                      value={editForm.currency}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, currency: event.target.value }))
                      }
                      placeholder="NGN"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Monthly budget cap" htmlFor="edit-client-budget-cap">
                    <input
                      id="edit-client-budget-cap"
                      type="number"
                      value={editForm.monthlyBudgetCap ?? ''}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          monthlyBudgetCap: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                      placeholder="0"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </FormShell>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </TaskflowShell>
  );
}

export default ClientsPage;
