'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Clock,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Sparkles,
  Timer,
  Trash2,
  Zap,
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
import type {
  AutomationStatus,
  IAutomation,
  ICreateAutomationInput,
  PagePreviewState,
} from '@/lib/types';

const CHANNEL_ICON: Record<string, typeof Mail> = {
  Email: Mail,
  Chat: MessageSquare,
  Task: Sparkles,
};

const INITIAL_AUTOMATIONS: IAutomation[] = [
  {
    id: 'automation-1',
    name: 'Nudge overdue tasks',
    trigger: 'A task becomes overdue',
    action: 'Send an email to the assignee',
    status: 'Enabled',
    runs: 86,
    lastRan: '12 minutes ago',
    owner: 'Sarah Chen',
    channel: 'Email',
    createdAt: '2026-01-12',
  },
  {
    id: 'automation-2',
    name: 'Create follow-up after a client call',
    trigger: 'A meeting with a client ends',
    action: 'Create a follow-up task due in 2 days',
    status: 'Enabled',
    runs: 34,
    lastRan: '3 hours ago',
    owner: 'Marcus Reed',
    channel: 'Task',
    createdAt: '2026-02-02',
  },
  {
    id: 'automation-3',
    name: 'Notify the team when a payment lands',
    trigger: 'An invoice is marked as paid',
    action: 'Post a message in #finance',
    status: 'Enabled',
    runs: 21,
    lastRan: 'Yesterday',
    owner: 'Aisha Patel',
    channel: 'Chat',
    createdAt: '2026-02-19',
  },
  {
    id: 'automation-4',
    name: 'Weekly digest',
    trigger: 'Every Friday at 16:00',
    action: 'Email the workspace summary',
    status: 'Enabled',
    runs: 12,
    lastRan: 'Oct 16, 2026',
    owner: 'Priya Sharma',
    channel: 'Email',
    createdAt: '2026-03-01',
  },
  {
    id: 'automation-5',
    name: 'Ping sales on stalled proposals',
    trigger: 'A proposal has no activity for 7 days',
    action: 'Send a Slack message to the account owner',
    status: 'Disabled',
    runs: 0,
    lastRan: null,
    owner: 'Jon Bell',
    channel: 'Chat',
    createdAt: '2026-03-08',
  },
];

type AutomationFilter = 'All' | AutomationStatus;

interface AutomationsPageProps {
  preview?: PagePreviewState;
}

export function AutomationsPage({ preview }: AutomationsPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [automations, setAutomations] = useState<IAutomation[]>(INITIAL_AUTOMATIONS);
  const [filter, setFilter] = useState<AutomationFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ICreateAutomationInput>({
    name: '',
    trigger: '',
    action: '',
    status: 'Enabled',
  });

  const counts = useMemo(
    () => ({
      All: automations.length,
      Enabled: automations.filter((automation) => automation.status === 'Enabled').length,
      Disabled: automations.filter((automation) => automation.status === 'Disabled').length,
    }),
    [automations],
  );

  const visibleAutomations = useMemo(() => {
    const term = query.trim().toLowerCase();
    return automations.filter((automation) => {
      const matchesFilter = filter === 'All' || automation.status === filter;
      const matchesQuery =
        !term ||
        automation.name.toLowerCase().includes(term) ||
        automation.trigger.toLowerCase().includes(term) ||
        automation.action.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [automations, filter, query]);

  const totalRuns = automations.reduce((total, automation) => total + automation.runs, 0);
  const hoursSaved = Math.round((totalRuns * 0.25 * 10) / 10);

  function handleAddAutomation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.trigger.trim() || !form.action.trim()) return;

    const newAutomation: IAutomation = {
      id: `automation-${Date.now()}`,
      name: form.name.trim(),
      trigger: form.trigger.trim(),
      action: form.action.trim(),
      status: form.status ?? 'Enabled',
      runs: 0,
      lastRan: null,
      owner: 'You',
      channel: 'Task',
      createdAt: '2026-10-19',
    };

    setAutomations((current) => [newAutomation, ...current]);
    setForm({ name: '', trigger: '', action: '', status: 'Enabled' });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
    setNotice(`Automation “${newAutomation.name}” is ${newAutomation.status.toLowerCase()}.`);
  }

  function toggleAutomation(id: string) {
    setAutomations((current) =>
      current.map((automation) =>
        automation.id === id
          ? {
              ...automation,
              status:
                automation.status === 'Enabled' ? ('Disabled' as AutomationStatus) : ('Enabled' as AutomationStatus),
            }
          : automation,
      ),
    );
  }

  function runAutomation(id: string) {
    setAutomations((current) =>
      current.map((automation) =>
        automation.id === id
          ? { ...automation, runs: automation.runs + 1, lastRan: 'Just now' }
          : automation,
      ),
    );
    const automation = automations.find((item) => item.id === id);
    if (automation) setNotice(`“${automation.name}” ran just now.`);
  }

  function removeAutomation(id: string) {
    const automation = automations.find((item) => item.id === id);
    setAutomations((current) => current.filter((item) => item.id !== id));
    if (automation) setNotice(`“${automation.name}” was deleted.`);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="AUTOMATE"
        title="Automations"
        description="Let routine work happen in the background."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Plus className="size-[18px]" />
            New automation
          </button>
        }
      />

      {notice ? (
        <div
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl border border-[#c9f0dc] bg-[#eafaf3] px-4 py-3 text-sm font-medium text-[#25a66a]"
        >
          <Zap className="size-4" />
          {notice}
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="ml-auto text-xs font-semibold text-[#25a66a] underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Create new automation"
            description="Describe when it should run and what should happen."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddAutomation}
            submitLabel="Create automation"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Automation name" htmlFor="automation-name" className="sm:col-span-2">
                <input
                  id="automation-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Nudge overdue tasks"
                  className={inputClass}
                />
              </Field>
              <Field label="Trigger" htmlFor="automation-trigger">
                <input
                  id="automation-trigger"
                  value={form.trigger}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, trigger: event.target.value }))
                  }
                  placeholder="A task becomes overdue"
                  className={inputClass}
                />
              </Field>
              <Field label="Action" htmlFor="automation-action">
                <input
                  id="automation-action"
                  value={form.action}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, action: event.target.value }))
                  }
                  placeholder="Send an email to the assignee"
                  className={inputClass}
                />
              </Field>
              <Field label="Status" htmlFor="automation-status">
                <select
                  id="automation-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AutomationStatus,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Enabled', 'Disabled'] as AutomationStatus[]).map((automationStatus) => (
                    <option key={automationStatus} value={automationStatus}>
                      {automationStatus}
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
          label="Active rules"
          value={counts.Enabled}
          hint={`${counts.All} rules in total`}
          icon={Zap}
          tone="blue"
        />
        <StatCard
          label="Runs this month"
          value={totalRuns}
          hint="Automations executed"
          icon={Play}
          tone="green"
        />
        <StatCard
          label="Time saved"
          value={`${hoursSaved}h`}
          hint="Estimated manual work"
          icon={Timer}
          tone="purple"
        />
        <StatCard
          label="Disabled rules"
          value={counts.Disabled}
          hint="Not running right now"
          icon={Clock}
          tone="amber"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">All automations</h2>
            <p className="section-subtitle">
              {visibleAutomations.length} of {automations.length} rules shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<AutomationFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Enabled', label: 'Enabled', count: counts.Enabled },
                { value: 'Disabled', label: 'Disabled', count: counts.Disabled },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search automations…"
              className="sm:w-52"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading automations…" rows={3} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your automations.'} onRetry={retry} />
        ) : visibleAutomations.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={Zap}
            title={
              automations.length && preview !== 'empty'
                ? 'No automations match your filters'
                : 'No automations yet'
            }
            description={
              automations.length && preview !== 'empty'
                ? 'Try another search term or switch the status filter.'
                : 'Automate the repetitive parts of your week so the team can focus on the work that matters.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <Plus className="size-3.5" /> New automation
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleAutomations.map((automation) => {
              const ChannelIcon = CHANNEL_ICON[automation.channel] ?? Sparkles;
              const enabled = automation.status === 'Enabled';

              return (
                <article
                  key={automation.id}
                  className="flex flex-col rounded-2xl border border-[#edf0f5] bg-white p-5 transition hover:border-[#ffb9bb] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
                        <Zap className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#172033]">
                          {automation.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#8b96a9]">
                          Owned by {automation.owner}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${enabled ? 'Disable' : 'Enable'} ${automation.name}`}
                      onClick={() => toggleAutomation(String(automation.id))}
                      className={cn(
                        'relative mt-1 h-6 w-11 shrink-0 rounded-full transition',
                        enabled ? 'bg-[#25a66a]' : 'bg-[#dfe4ec]',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
                          enabled ? 'left-[22px]' : 'left-0.5',
                        )}
                      />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl bg-[#f8faff] p-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#a3adbc]">
                        When
                      </span>
                      <p className="text-xs font-medium text-[#566176]">{automation.trigger}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#a3adbc]">
                        Then
                      </span>
                      <p className="flex-1 text-xs font-medium text-[#172033]">
                        {automation.action}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f4f6f9] pt-4 text-xs text-[#8b96a9]">
                    <span className="inline-flex items-center gap-1.5">
                      <ChannelIcon className="size-3.5" />
                      {automation.channel}
                    </span>
                    <span>
                      {automation.runs} runs · {automation.lastRan ?? 'Never ran'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => runAutomation(String(automation.id))}
                      className="soft-button flex-1 justify-center"
                    >
                      <Play className="size-3.5" /> Run now
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAutomation(String(automation.id))}
                      aria-label={`Delete ${automation.name}`}
                      className="soft-button px-2 hover:border-[#ff646b] hover:text-[#ff646b]"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default AutomationsPage;
