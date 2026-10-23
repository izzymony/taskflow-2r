'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Copy,
  GitBranch,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCw,
  Timer,
  Workflow as WorkflowIcon,
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
  ICreateWorkflowInput,
  IWorkflow,
  PagePreviewState,
  WorkflowStatus,
} from '@/lib/types';

const statusTone: Record<WorkflowStatus, string> = {
  Active: 'status-green',
  Draft: 'status-amber',
  Paused: 'status-muted',
};

const INITIAL_WORKFLOWS: IWorkflow[] = [
  {
    id: 'workflow-1',
    name: 'Client onboarding',
    description: 'From signed contract to a fully staffed project in three days.',
    status: 'Active',
    runs: 128,
    lastRun: '2 hours ago',
    owner: 'Sarah Chen',
    steps: ['Collect signed contract', 'Create project workspace', 'Schedule kickoff call', 'Assign delivery lead'],
    successRate: 96,
    createdAt: '2026-01-08',
  },
  {
    id: 'workflow-2',
    name: 'Weekly content review',
    description: 'Collect drafts, route them to reviewers, and publish on schedule.',
    status: 'Active',
    runs: 64,
    lastRun: 'Yesterday',
    owner: 'Marcus Reed',
    steps: ['Gather submissions', 'Editorial review', 'Legal sign-off', 'Schedule publish'],
    successRate: 91,
    createdAt: '2026-01-22',
  },
  {
    id: 'workflow-3',
    name: 'Invoice approval',
    description: 'Route incoming invoices to finance before they reach the client.',
    status: 'Active',
    runs: 42,
    lastRun: '3 hours ago',
    owner: 'Aisha Patel',
    steps: ['Validate invoice', 'Manager approval', 'Finance check', 'Send to client'],
    successRate: 88,
    createdAt: '2026-02-04',
  },
  {
    id: 'workflow-4',
    name: 'Quarterly planning',
    description: 'Runs once a quarter to align roadmap, budget and capacity.',
    status: 'Paused',
    runs: 3,
    lastRun: 'Aug 01, 2026',
    owner: 'Maya Chen',
    steps: ['Collect team input', 'Prioritise roadmap', 'Budget review', 'Publish plan'],
    successRate: 74,
    createdAt: '2026-02-18',
  },
  {
    id: 'workflow-5',
    name: 'Support escalation',
    description: 'Escalate stalled client work to the account lead automatically.',
    status: 'Draft',
    runs: 0,
    lastRun: null,
    owner: 'Jon Bell',
    steps: ['Detect stalled task', 'Notify account lead', 'Open escalation task'],
    successRate: 0,
    createdAt: '2026-03-11',
  },
];

type WorkflowFilter = 'All' | WorkflowStatus;

interface WorkflowsPageProps {
  preview?: PagePreviewState;
}

export function WorkflowsPage({ preview }: WorkflowsPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [workflows, setWorkflows] = useState<IWorkflow[]>(INITIAL_WORKFLOWS);
  const [filter, setFilter] = useState<WorkflowFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ICreateWorkflowInput>({
    name: '',
    description: '',
    status: 'Draft',
  });

  const counts = useMemo(
    () => ({
      All: workflows.length,
      Active: workflows.filter((workflow) => workflow.status === 'Active').length,
      Draft: workflows.filter((workflow) => workflow.status === 'Draft').length,
      Paused: workflows.filter((workflow) => workflow.status === 'Paused').length,
    }),
    [workflows],
  );

  const visibleWorkflows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return workflows.filter((workflow) => {
      const matchesFilter = filter === 'All' || workflow.status === filter;
      const matchesQuery =
        !term ||
        workflow.name.toLowerCase().includes(term) ||
        workflow.description.toLowerCase().includes(term) ||
        workflow.owner.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [workflows, filter, query]);

  const totalRuns = workflows.reduce((total, workflow) => total + workflow.runs, 0);
  const activeWorkflows = workflows.filter((workflow) => workflow.status === 'Active');
  const averageSuccess = activeWorkflows.length
    ? Math.round(
        activeWorkflows.reduce((total, workflow) => total + workflow.successRate, 0) /
          activeWorkflows.length,
      )
    : 0;

  function handleAddWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    const newWorkflow: IWorkflow = {
      id: `workflow-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status ?? 'Draft',
      runs: 0,
      lastRun: null,
      owner: 'You',
      steps: ['Add your first step'],
      successRate: 0,
      createdAt: '2026-10-19',
    };

    setWorkflows((current) => [newWorkflow, ...current]);
    setForm({ name: '', description: '', status: 'Draft' });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
    setNotice(`Workflow “${newWorkflow.name}” created.`);
  }

  function runWorkflow(id: string) {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === id
          ? { ...workflow, runs: workflow.runs + 1, lastRun: 'Just now', status: 'Active' as WorkflowStatus }
          : workflow,
      ),
    );
    const workflow = workflows.find((item) => item.id === id);
    if (workflow) setNotice(`${workflow.name} started a run.`);
  }

  function toggleStatus(id: string) {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === id
          ? {
              ...workflow,
              status: workflow.status === 'Paused' ? ('Active' as WorkflowStatus) : ('Paused' as WorkflowStatus),
            }
          : workflow,
      ),
    );
  }

  function duplicateWorkflow(id: string) {
    const workflow = workflows.find((item) => item.id === id);
    if (!workflow) return;
    const copy: IWorkflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      name: `${workflow.name} (copy)`,
      status: 'Draft',
      runs: 0,
      lastRun: null,
      createdAt: '2026-10-19',
    };
    setWorkflows((current) => [copy, ...current]);
    setNotice(`Duplicated “${workflow.name}”.`);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="OPERATIONS"
        title="Workflows"
        description="Build repeatable processes your team can trust."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Plus className="size-[18px]" />
            New workflow
          </button>
        }
      />

      {notice ? (
        <div
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl border border-[#c9f0dc] bg-[#eafaf3] px-4 py-3 text-sm font-medium text-[#25a66a]"
        >
          <ListChecks className="size-4" />
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
            title="Create new workflow"
            description="Describe the process — you can add steps once it is saved."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddWorkflow}
            submitLabel="Create workflow"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Workflow name" htmlFor="workflow-name" className="sm:col-span-2">
                <input
                  id="workflow-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Client onboarding"
                  className={inputClass}
                />
              </Field>
              <Field label="Description" htmlFor="workflow-description" className="sm:col-span-2">
                <textarea
                  id="workflow-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="What does this process do?"
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <Field label="Status" htmlFor="workflow-status">
                <select
                  id="workflow-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as WorkflowStatus,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Draft', 'Active', 'Paused'] as WorkflowStatus[]).map((workflowStatus) => (
                    <option key={workflowStatus} value={workflowStatus}>
                      {workflowStatus}
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
          label="Active workflows"
          value={counts.Active}
          hint={`${counts.All} workflows in total`}
          icon={WorkflowIcon}
          tone="blue"
        />
        <StatCard
          label="Total runs"
          value={totalRuns}
          hint="Since the workspace started"
          icon={RotateCw}
          tone="green"
        />
        <StatCard
          label="Success rate"
          value={`${averageSuccess}%`}
          hint="Across active workflows"
          icon={ListChecks}
          tone="purple"
        />
        <StatCard
          label="Needs attention"
          value={counts.Draft + counts.Paused}
          hint="Drafts and paused flows"
          icon={Timer}
          tone="amber"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">All workflows</h2>
            <p className="section-subtitle">
              {visibleWorkflows.length} of {workflows.length} workflows shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<WorkflowFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Active', label: 'Active', count: counts.Active },
                { value: 'Draft', label: 'Draft', count: counts.Draft },
                { value: 'Paused', label: 'Paused', count: counts.Paused },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search workflows…"
              className="sm:w-52"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading workflows…" rows={3} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your workflows.'} onRetry={retry} />
        ) : visibleWorkflows.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={GitBranch}
            title={
              workflows.length && preview !== 'empty'
                ? 'No workflows match your filters'
                : 'No workflows yet'
            }
            description={
              workflows.length && preview !== 'empty'
                ? 'Try another search term or switch the status filter.'
                : 'Turn a repetitive task into a workflow so the team can run it the same way every time.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <Plus className="size-3.5" /> New workflow
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleWorkflows.map((workflow) => (
              <article
                key={workflow.id}
                className="flex flex-col rounded-2xl border border-[#edf0f5] bg-white p-5 transition hover:border-[#ffb9bb] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#172033]">{workflow.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#7f8a9e]">{workflow.description}</p>
                  </div>
                  <span className={cn('status-pill shrink-0', statusTone[workflow.status])}>
                    {workflow.status}
                  </span>
                </div>

                <ol className="mt-4 space-y-2">
                  {workflow.steps.map((step, index) => (
                    <li key={step} className="flex items-center gap-2 text-xs text-[#566176]">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-[10px] font-bold text-[#4e7cff]">
                        {index + 1}
                      </span>
                      <span className="truncate">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#f4f6f9] pt-4 text-center">
                  <div>
                    <p className="text-sm font-bold text-[#172033]">{workflow.runs}</p>
                    <p className="text-[10px] text-[#8b96a9]">Runs</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#172033]">{workflow.successRate}%</p>
                    <p className="text-[10px] text-[#8b96a9]">Success</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#172033]">
                      {workflow.lastRun ?? 'Never'}
                    </p>
                    <p className="text-[10px] text-[#8b96a9]">Last run</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runWorkflow(String(workflow.id))}
                    disabled={workflow.status === 'Draft'}
                    className="soft-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Play className="size-3.5" /> Run now
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(String(workflow.id))}
                    disabled={workflow.status === 'Draft'}
                    className="soft-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {workflow.status === 'Paused' ? (
                      <>
                        <Play className="size-3.5" /> Activate
                      </>
                    ) : (
                      <>
                        <Pause className="size-3.5" /> Pause
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateWorkflow(String(workflow.id))}
                    aria-label={`Duplicate ${workflow.name}`}
                    className="soft-button px-2"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-[#aeb9cc]">Owned by {workflow.owner}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default WorkflowsPage;
