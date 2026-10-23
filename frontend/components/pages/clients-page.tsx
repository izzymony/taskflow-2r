'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Archive,
  Building2,
  FolderKanban,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';

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
  inputClass,
  selectClass,
} from '@/components/ui/page-kit';
import { useResource } from '@/hooks/use-resource';
import { cn } from '@/lib/utils';
import type { ClientPlan, ClientStatus, IClient, PagePreviewState } from '@/lib/types';

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

const INITIAL_CLIENTS: IClient[] = [
  {
    id: 'client-1',
    company: 'Northstar Studio',
    contactName: 'Amanuel Tadesse',
    email: 'amanuel@northstar.studio',
    phone: '+1 (555) 014-2281',
    userId:'hfjf',
    status: 'Active',
    lastActivity: '2 hours ago',
    createdAt: '2026-01-15',
    avatar: 'AT',
    plan: 'Enterprise',
    value: 12500,
    location: 'Austin, TX',
    projects: 4,
    title: 'Northstar Studio',
    billingType: 'Hourly',
    rate: '150.00',
    currency: 'NGN',
    monthlyBudgetCap: null,
  },
  {
    id: 'client-2',
    company: 'Brightline Labs',
    contactName: 'Maya Chen',
    userId:'hfjf',
    email: 'maya@brightline.io',
    phone: '+1 (555) 019-3341',
    status: 'Active',
    lastActivity: '5 hours ago',
    createdAt: '2026-02-03',
    avatar: 'MC',
    plan: 'Growth',
    value: 8200,
    location: 'Seattle, WA',
    projects: 3,
    title: 'Brightline Labs',
    billingType: 'Retainer',
    rate: '120.00',
    currency: 'NGN',
    monthlyBudgetCap: null,
  },
  {
    id: 'client-3',
    company: 'Cedar & Co.',
    contactName: 'Jon Bell',
    userId:'hfjf',
    email: 'jon@cedar.co',
    phone: '+1 (555) 012-1109',
    status: 'Pending',
    lastActivity: '1 day ago',
    createdAt: '2026-02-10',
    avatar: 'JB',
    plan: 'Starter',
    value: 3200,
    location: 'Portland, OR',
    projects: 1,
    title: 'Cedar & Co.',
    billingType: 'Fixed_Project',
    rate: '200.00',
    currency: 'NGN',
    monthlyBudgetCap: 5000,
  },
  {
    id: 'client-4',
    company: 'Summit Works',
    userId:'hfjf',
    contactName: 'Priya Sharma',
    email: 'priya@summit.works',
    phone: '+1 (555) 017-4451',
    status: 'Inactive',
    lastActivity: '3 weeks ago',
    createdAt: '2026-01-22',
    avatar: 'PS',
    plan: 'Growth',
    value: 5400,
    location: 'Denver, CO',
    projects: 2,
    title: 'Summit Works',
    billingType: 'Hourly',
    rate: '100.00',
    currency: 'NGN',
    monthlyBudgetCap: null,
  },
  {
    id: 'client-5',
    userId:'hfjf',
    company: 'Nexus Digital',
    contactName: 'Omar Hassan',
    email: 'omar@nexus.digital',
    phone: '+1 (555) 021-9902',
    status: 'Active',
    lastActivity: '4 hours ago',
    createdAt: '2026-03-01',
    avatar: 'OH',
    plan: 'Enterprise',
    value: 15600,
    location: 'Brooklyn, NY',
    projects: 5,
    title: 'Nexus Digital',
    billingType: 'Retainer',
    rate: '180.00',
    currency: 'NGN',
    monthlyBudgetCap: null,
  },
  {
    id: 'client-6',
    userId:'hfjf',
    company: 'Halcyon Group',
    contactName: 'Elena Ruiz',
    email: 'elena@halcyon.group',
    phone: '+1 (555) 023-7714',
    status: 'Pending',
    lastActivity: '6 hours ago',
    createdAt: '2026-03-12',
    avatar: 'ER',
    plan: 'Starter',
    value: 1800,
    location: 'Miami, FL',
    projects: 1,
    title: 'Halcyon Group',
    billingType: 'Hourly',
    rate: '90.00',
    currency: 'NGN',
    monthlyBudgetCap: null,
  },
];

type ClientFilter = 'All' | ClientStatus;

interface ClientsPageProps {
  preview?: PagePreviewState;
}

export function ClientsPage({ preview }: ClientsPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [clients, setClients] = useState<IClient[]>(INITIAL_CLIENTS);
  const [filter, setFilter] = useState<ClientFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    company: '',
    contactName: '',userId:"",
    email: '',
    phone: '',
    plan: 'Growth' as ClientPlan,
  });

  const counts = useMemo(
    () => ({
      All: clients.length,
      Active: clients.filter((client) => client.status === 'Active').length,
      Pending: clients.filter((client) => client.status === 'Pending').length,
      Inactive: clients.filter((client) => client.status === 'Inactive').length,
    }),
    [clients],
  );

  const visibleClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesFilter = filter === 'All' || client.status === filter;
      const matchesQuery =
        !term ||
        client.company.toLowerCase().includes(term) ||
        client.contactName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [clients, filter, query]);

  const monthlyValue = useMemo(
    () => clients.reduce((total, client) => total + client.value, 0),
    [clients],
  );

  function handleAddClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.company.trim() || !form.contactName.trim() || !form.email.trim()) return;

    const newClient: IClient = {
      id: `client-${Date.now()}`,
      company: form.company.trim(),
      title: form.company.trim(),
      userId: form.userId.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: 'Pending',
      lastActivity: 'Just now',
      createdAt: '2026-03-18',
      avatar: form.contactName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
      plan: form.plan,
      billingType: 'Hourly',
      rate: '0.00',
      currency: 'NGN',
      monthlyBudgetCap: null,
      value: 0,
      location: 'Not set',
      projects: 0,
    };

    setClients((current) => [newClient, ...current]);
    setForm({ company: '', contactName: '', email: '', phone: '', plan: 'Growth', userId:"" });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
  }

  function archiveClient(id: string) {
    setClients((current) =>
      current.map((client) =>
        client.id === id ? { ...client, status: 'Inactive' as ClientStatus } : client,
      ),
    );
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
              {visibleClients.length} of {clients.length} clients shown
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
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading clients…" rows={3} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your clients.'} onRetry={retry} />
        ) : visibleClients.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={Building2}
            title={
              clients.length && preview !== 'empty'
                ? 'No clients match your filters'
                : 'No clients yet'
            }
            description={
              clients.length && preview !== 'empty'
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
              <article
                key={client.id}
                className="rounded-2xl border border-[#edf0f5] bg-white p-5 transition hover:border-[#ffb9bb] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-sm font-bold text-[#4e7cff]">
                    {client.avatar || client.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#172033]">
                          {client.company}
                        </h3>
                        <p className="truncate text-xs text-[#8b96a9]">{client.contactName}</p>
                      </div>
                      <span className={cn('status-pill shrink-0', statusTone[client.status])}>
                        {client.status}
                      </span>
                    </div>
                    <span className={cn('tag-chip mt-2 inline-block', planTone[client.plan])}>
                      {client.plan}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 text-sm text-[#566176] transition hover:text-[#ff646b]"
                  >
                    <Mail className="size-3.5 shrink-0 text-[#a3adbc]" />
                    <span className="truncate">{client.email}</span>
                  </a>
                  <a
                    href={`tel:${client.phone.replace(/[^+\d]/g, '')}`}
                    className="flex items-center gap-2 text-sm text-[#566176] transition hover:text-[#ff646b]"
                  >
                    <Phone className="size-3.5 shrink-0 text-[#a3adbc]" />
                    <span className="truncate">{client.phone}</span>
                  </a>
                  <p className="flex items-center gap-2 text-sm text-[#566176]">
                    <MapPin className="size-3.5 shrink-0 text-[#a3adbc]" />
                    {client.location}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#f4f6f9] pt-3 text-xs">
                  <span className="text-[#aeb9cc]">Last active {client.lastActivity}</span>
                  <span className="font-semibold text-[#172033]">
                    ${client.value.toLocaleString()}/mo
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <a href={`mailto:${client.email}`} className="soft-button flex-1 justify-center">
                    <Mail className="size-3.5" /> Email
                  </a>
                  <a
                    href={`tel:${client.phone.replace(/[^+\d]/g, '')}`}
                    className="soft-button flex-1 justify-center"
                  >
                    <Phone className="size-3.5" /> Call
                  </a>
                  <button
                    type="button"
                    onClick={() => archiveClient(String(client.id))}
                    disabled={client.status === 'Inactive'}
                    aria-label={`Archive ${client.company}`}
                    className="soft-button px-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Archive className="size-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default ClientsPage;
