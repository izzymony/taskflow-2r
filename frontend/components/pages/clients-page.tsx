'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  Building2,
  CheckCircle2,
  Download,
  Edit2,
  Filter,
  FolderKanban,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MoreHorizontal,
  MoreVertical,
  Phone,
  Plus,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
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

type ClientFilter = 'All' | 'Active' | 'Pending' | 'Inactive' | 'VIP';

interface ClientsPageProps {
  preview?: PagePreviewState;
}

// Reference contacts from the design mockup when database is empty
const DEMO_CONTACTS: IClient[] = [
  {
    id: 'demo-1',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0101',
    status: 'Active',
    plan: 'Growth',
    billingType: 'Hourly',
    rate: '150.00',
    currency: 'USD',
    monthlyBudgetCap: 5000,
    lastActivity: '2 hours ago',
    createdAt: new Date().toISOString(),
    value: 85,
    location: 'San Francisco, CA',
    projects: 3,
  },
  {
    id: 'demo-2',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0102',
    status: 'Active',
    plan: 'Starter',
    billingType: 'Hourly',
    rate: '120.00',
    currency: 'USD',
    monthlyBudgetCap: 3000,
    lastActivity: '1 day ago',
    createdAt: new Date().toISOString(),
    value: 72,
    location: 'Austin, TX',
    projects: 2,
  },
  {
    id: 'demo-3',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0103',
    status: 'Active',
    plan: 'Enterprise',
    billingType: 'Retainer',
    rate: '250.00',
    currency: 'USD',
    monthlyBudgetCap: 10000,
    lastActivity: '3 days ago',
    createdAt: new Date().toISOString(),
    value: 91,
    location: 'New York, NY',
    projects: 5,
  },
  {
    id: 'demo-4',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0104',
    status: 'Active',
    plan: 'Starter',
    billingType: 'Fixed_Project',
    rate: '90.00',
    currency: 'USD',
    monthlyBudgetCap: 2000,
    lastActivity: '4 days ago',
    createdAt: new Date().toISOString(),
    value: 24,
    location: 'Seattle, WA',
    projects: 1,
  },
  {
    id: 'demo-5',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0105',
    status: 'Inactive',
    plan: 'Growth',
    billingType: 'Hourly',
    rate: '110.00',
    currency: 'USD',
    monthlyBudgetCap: 4000,
    lastActivity: '2 weeks ago',
    createdAt: new Date().toISOString(),
    value: 34,
    location: 'Chicago, IL',
    projects: 0,
  },
  {
    id: 'demo-6',
    userId: 1,
    title: 'Michel Chen',
    company: 'Michel Chen',
    contactName: 'Michel Chen',
    email: 'm.chen@example.com',
    phone: '+1 555-0106',
    status: 'Active',
    plan: 'Growth',
    billingType: 'Hourly',
    rate: '140.00',
    currency: 'USD',
    monthlyBudgetCap: 4500,
    lastActivity: '3 weeks ago',
    createdAt: new Date().toISOString(),
    value: 46,
    location: 'Denver, CO',
    projects: 2,
  },
];

export function ClientsPage({ preview }: ClientsPageProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ClientFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message?: string } | null>(null);

  const [form, setForm] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    plan: 'Growth' as ClientPlan,
    status: 'Active' as ClientStatus,
    billingType: 'Hourly' as BillingType,
    rate: '',
    currency: 'USD',
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

  // Use database data if available; fallback to realistic mockup contacts if database is empty
  const rawList: IClient[] = clientsQuery.data ?? [];
  const isUsingDemo = rawList.length === 0 && preview !== 'empty';
  const clientsList: IClient[] = isUsingDemo ? DEMO_CONTACTS : rawList;

  const counts = useMemo(
    () => ({
      All: clientsList.length,
      Active: clientsList.filter((client) => client.status === 'Active').length,
      Pending: clientsList.filter((client) => client.status === 'Pending').length,
      Inactive: clientsList.filter((client) => client.status === 'Inactive').length,
      VIP: clientsList.filter((client) => client.plan === 'Enterprise').length,
    }),
    [clientsList],
  );

  const visibleClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return clientsList.filter((client) => {
      let matchesFilter = true;
      if (filter === 'Active') matchesFilter = client.status === 'Active';
      else if (filter === 'Inactive') matchesFilter = client.status === 'Inactive';
      else if (filter === 'Pending') matchesFilter = client.status === 'Pending';
      else if (filter === 'VIP') matchesFilter = client.plan === 'Enterprise';

      const matchesQuery =
        !term ||
        client.company.toLowerCase().includes(term) ||
        (client.contactName && client.contactName.toLowerCase().includes(term)) ||
        (client.email && client.email.toLowerCase().includes(term));
      return matchesFilter && matchesQuery;
    });
  }, [clientsList, filter, query]);

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
        plan: 'Growth',
        status: 'Active',
        billingType: 'Hourly',
        rate: '',
        currency: 'USD',
        monthlyBudgetCap: null,
      });
      setToast({ type: 'success', title: 'Contact created', message: 'New contact has been added to Audience.' });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Parameters<typeof clients.update>[1]> }) =>
      clients.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditOpen(false);
      setToast({ type: 'success', title: 'Contact updated', message: 'Contact details have been saved.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clients.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setToast({ type: 'success', title: 'Contact removed', message: 'The contact has been deleted.' });
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
        status: 'Active',
        dueDate: '',
      });
      setToast({ type: 'success', title: 'Project created', message: 'New project has been added.' });
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
    currency: 'USD',
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
    setActiveMenuId(null);
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

    const name = form.contactName.trim() || form.company.trim();
    if (!name) {
      setError('Contact or company name is required');
      return;
    }
    const phone = form.phone.trim() || '08000000000';

    createMutation.mutate({
      id: `client-${Date.now()}`,
      title: name,
      company: form.company.trim() || name,
      contactName: name,
      email: form.email.trim() || null,
      phone: phone.slice(0, 11),
      status: form.status,
      plan: form.plan,
      billingType: form.billingType,
      rate: form.rate.trim() || '0.00',
      currency: form.currency.trim() || 'USD',
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
    setActiveMenuId(null);
    updateMutation.mutate({ id, input: { status: 'Inactive' as ClientStatus } });
  }

  function deleteClient(id: string) {
    setActiveMenuId(null);
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    deleteMutation.mutate(id);
  }

  return (
    <TaskflowShell>
      {/* Page Header Area */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Audience</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Manage your contacts and segments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setToast({ type: 'info', title: 'Export started', message: 'Your contacts export is generating.' })}
            className="export-button"
          >
            <Download className="size-3.5" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="primary-button"
          >
            <Plus className="size-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      {/* Top 4 KPI Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard
          label="Total Contacts"
          value={isUsingDemo ? '8,429' : counts.All.toLocaleString()}
          icon={Users}
          tone="purple"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          label="Subscribed"
          value={isUsingDemo ? '7,195' : counts.Active.toLocaleString()}
          icon={UserCheck}
          tone="green"
          trend={{ value: '+23%', positive: true }}
        />
        <StatCard
          label="Unsubscribed"
          value={isUsingDemo ? '1,234' : counts.Inactive.toLocaleString()}
          icon={UserMinus}
          tone="coral"
          trend={{ value: '-5%', positive: false }}
        />
        <StatCard
          label="Engagement Rate"
          value="68.5%"
          icon={TrendingUp}
          tone="blue"
          trend={{ value: '+5.2%', positive: true }}
        />
      </div>

      {/* Two Column Section: Table Card (Left) & Segments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: All Contacts Table Panel (~72% on lg) */}
        <section className="lg:col-span-8 xl:col-span-9 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          {/* Card Top Toolbar */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">All Contacts</h2>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Contacts Input */}
              <div className="relative w-full sm:w-64">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Search Contacts..."
                />
              </div>

              {/* Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setFilter((f) => (f === 'All' ? 'Active' : 'All'))}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                  filter !== 'All'
                    ? 'border-[#6355ff] bg-[#f0efff] text-[#6355ff]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Filters</span>
              </button>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  aria-label="Table view"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg transition',
                    viewMode === 'table' ? 'bg-white text-[#6355ff] shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg transition',
                    viewMode === 'grid' ? 'bg-white text-[#6355ff] shadow-2xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table / Grid Content */}
          {clientsQuery.isPending && !isUsingDemo ? (
            <PageLoading label="Loading contacts…" rows={5} />
          ) : clientsQuery.isError && !isUsingDemo ? (
            <PageError message={clientsQuery.error.message} onRetry={() => clientsQuery.refetch()} />
          ) : visibleClients.length === 0 || preview === 'empty' ? (
            <EmptyState
              icon={Building2}
              title="No contacts match your filters"
              description="Try adjusting your search query or select another segment."
              action={
                <button type="button" onClick={() => setIsAdding(true)} className="primary-button text-xs">
                  <UserPlus className="size-3.5" /> Add Contact
                </button>
              }
            />
          ) : viewMode === 'grid' ? (
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
          ) : (
            /* Reference Image Clean Table */
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                    <th scope="col" className="px-6 py-3 font-medium">Contact</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Last Active</th>
                    <th scope="col" className="px-4 py-3 font-medium">Engagement</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {visibleClients.map((client) => {
                    const isSubscribed = client.status === 'Active';
                    const isUnsubscribed = client.status === 'Inactive';
                    const engagementVal = typeof client.value === 'number' && client.value <= 100 ? `${client.value}%` : '85%';

                    return (
                      <tr
                        key={client.id}
                        className="group hover:bg-[#f8faff] transition-colors"
                      >
                        {/* Contact Cell: Avatar + Name + Email */}
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden ring-1 ring-slate-200/60">
                              {client.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {client.contactName || client.company}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {client.email || 'm.chen@example.com'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status Cell */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isSubscribed ? (
                            <span className="text-[#5850ec] font-medium text-xs">Subscribed</span>
                          ) : isUnsubscribed ? (
                            <span className="text-[#eb5757] font-medium text-xs">Unsubscribed</span>
                          ) : (
                            <span className="text-amber-600 font-medium text-xs">Pending</span>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-xs">
                          {client.lastActivity || '2 hours ago'}
                        </td>

                        {/* Engagement Rate */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium text-xs">
                          {engagementVal}
                        </td>

                        {/* Action Menu (Three dots) */}
                        <td className="px-6 py-3.5 whitespace-nowrap text-right relative">
                          <button
                            type="button"
                            aria-label="Actions"
                            onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {activeMenuId === client.id && (
                            <div className="absolute right-6 top-10 z-30 w-36 rounded-xl border border-slate-100 bg-white p-1 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() => openEditClient(client)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Edit2 className="size-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => archiveClient(client.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Archive className="size-3.5" /> Archive
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteClient(client.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="size-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right Column: Segments Card Stack (~28% on lg) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Segments</h2>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-xs font-semibold text-[#6355ff] hover:underline"
            >
              Create New
            </button>
          </div>

          {/* Segment Card 1: All Subscribers */}
          <div
            onClick={() => setFilter('All')}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] cursor-pointer transition-all hover:shadow-md',
              filter === 'All' ? 'border-[#6355ff] ring-2 ring-[#6355ff]/10' : 'border-slate-100 hover:border-slate-200'
            )}
          >
            <p className="text-xs font-medium text-slate-500">All Subscribers</p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {isUsingDemo ? '8,429' : counts.All.toLocaleString()}
              </p>
              <span className="trend-badge-up text-xs">
                <TrendingUp className="size-3" />
                <span>+12%</span>
              </span>
            </div>
          </div>

          {/* Segment Card 2: Active Customers */}
          <div
            onClick={() => setFilter('Active')}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] cursor-pointer transition-all hover:shadow-md',
              filter === 'Active' ? 'border-[#6355ff] ring-2 ring-[#6355ff]/10' : 'border-slate-100 hover:border-slate-200'
            )}
          >
            <p className="text-xs font-medium text-slate-500">Active Customers</p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {isUsingDemo ? '2,450' : counts.Active.toLocaleString()}
              </p>
              <span className="trend-badge-up text-xs">
                <TrendingUp className="size-3" />
                <span>+8%</span>
              </span>
            </div>
          </div>

          {/* Segment Card 3: VIP Members */}
          <div
            onClick={() => setFilter('VIP')}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] cursor-pointer transition-all hover:shadow-md',
              filter === 'VIP' ? 'border-[#6355ff] ring-2 ring-[#6355ff]/10' : 'border-slate-100 hover:border-slate-200'
            )}
          >
            <p className="text-xs font-medium text-slate-500">VIP Members</p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">890</p>
              <span className="trend-badge-up text-xs">
                <TrendingUp className="size-3" />
                <span>+15%</span>
              </span>
            </div>
          </div>

          {/* Segment Card 4: Inactive Users */}
          <div
            onClick={() => setFilter('Inactive')}
            className={cn(
              'rounded-2xl border bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] cursor-pointer transition-all hover:shadow-md',
              filter === 'Inactive' ? 'border-[#6355ff] ring-2 ring-[#6355ff]/10' : 'border-slate-100 hover:border-slate-200'
            )}
          >
            <p className="text-xs font-medium text-slate-500">Inactive Users</p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {isUsingDemo ? '1,234' : counts.Inactive.toLocaleString()}
              </p>
              <span className="trend-badge-down text-xs">
                <TrendingDown className="size-3" />
                <span>-5%</span>
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Add Contact Modal Dialog */}
      {isAdding && (
        <Dialog.Root open={isAdding} onOpenChange={setIsAdding}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Add New Contact</Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Add a contact to your workspace audience.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              <FormShell
                title=""
                description=""
                onCancel={() => setIsAdding(false)}
                onSubmit={handleAddClient}
                submitLabel="Add Contact"
                isSubmitting={createMutation.isPending}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact Name" htmlFor="contact-name">
                    <input
                      id="contact-name"
                      value={form.contactName}
                      onChange={(e) => setForm((c) => ({ ...c, contactName: e.target.value }))}
                      placeholder="Michel Chen"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Company / Organization" htmlFor="client-company">
                    <input
                      id="client-company"
                      value={form.company}
                      onChange={(e) => setForm((c) => ({ ...c, company: e.target.value }))}
                      placeholder="Acme Studio"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" htmlFor="client-email">
                    <input
                      id="client-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                      placeholder="m.chen@example.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone" htmlFor="client-phone">
                    <input
                      id="client-phone"
                      value={form.phone}
                      onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                      placeholder="+1 555-0101"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Status" htmlFor="client-status">
                    <select
                      id="client-status"
                      value={form.status}
                      onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as ClientStatus }))}
                      className={selectClass}
                    >
                      <option value="Active">Subscribed (Active)</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Unsubscribed (Inactive)</option>
                    </select>
                  </Field>
                  <Field label="Plan" htmlFor="client-plan">
                    <select
                      id="client-plan"
                      value={form.plan}
                      onChange={(e) => setForm((c) => ({ ...c, plan: e.target.value as ClientPlan }))}
                      className={selectClass}
                    >
                      <option value="Starter">Starter</option>
                      <option value="Growth">Growth</option>
                      <option value="Enterprise">VIP / Enterprise</option>
                    </select>
                  </Field>
                </div>
              </FormShell>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* Edit Client Modal Dialog */}
      {editOpen && editingClient && (
        <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Edit Contact</Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Update {editingClient.company} details.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              <FormShell
                title=""
                description=""
                onCancel={() => setEditOpen(false)}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!editForm.company.trim() && !editForm.contactName.trim()) return;
                  editMutation.mutate({
                    id: editingClient.id,
                    input: {
                      company: editForm.company.trim() || editForm.contactName.trim(),
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
                  <Field label="Contact Name" htmlFor="edit-contact-name">
                    <input
                      id="edit-contact-name"
                      value={editForm.contactName}
                      onChange={(e) => setEditForm((c) => ({ ...c, contactName: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Company" htmlFor="edit-client-company">
                    <input
                      id="edit-client-company"
                      value={editForm.company}
                      onChange={(e) => setEditForm((c) => ({ ...c, company: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" htmlFor="edit-client-email">
                    <input
                      id="edit-client-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((c) => ({ ...c, email: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone" htmlFor="edit-client-phone">
                    <input
                      id="edit-client-phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((c) => ({ ...c, phone: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Status" htmlFor="edit-client-status">
                    <select
                      id="edit-client-status"
                      value={editForm.status}
                      onChange={(e) => setEditForm((c) => ({ ...c, status: e.target.value as ClientStatus }))}
                      className={selectClass}
                    >
                      <option value="Active">Subscribed (Active)</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Unsubscribed (Inactive)</option>
                    </select>
                  </Field>
                  <Field label="Plan" htmlFor="edit-client-plan">
                    <select
                      id="edit-client-plan"
                      value={editForm.plan}
                      onChange={(e) => setEditForm((c) => ({ ...c, plan: e.target.value as ClientPlan }))}
                      className={selectClass}
                    >
                      <option value="Starter">Starter</option>
                      <option value="Growth">Growth</option>
                      <option value="Enterprise">VIP / Enterprise</option>
                    </select>
                  </Field>
                </div>
              </FormShell>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* Toast Notification */}
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
