'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Archive,
  BookOpen,
  FileText,
  MessageSquare,
  PenLine,
  Plus,
  Send,
  Trash2,
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
import type { DocStatus, ICreateDocInput, IDoc, PagePreviewState } from '@/lib/types';

const statusTone: Record<DocStatus, string> = {
  Published: 'status-green',
  Draft: 'status-amber',
  Archived: 'status-muted',
};

const CATEGORIES = ['Product', 'Engineering', 'Company', 'Design', 'Sales'];

const INITIAL_DOCS: IDoc[] = [
  {
    id: 'doc-1',
    title: 'Getting started with taskflow',
    owner: 'Sarah Chen',
    lastEdited: '2 hours ago',
    status: 'Published',
    category: 'Company',
    comments: 4,
    createdAt: '2026-01-10',
  },
  {
    id: 'doc-2',
    title: 'Team handbook',
    owner: 'Marcus Reed',
    lastEdited: '5 hours ago',
    status: 'Published',
    category: 'Company',
    comments: 12,
    createdAt: '2026-01-15',
  },
  {
    id: 'doc-3',
    title: 'Product requirements — workspace pages',
    owner: 'Aisha Patel',
    lastEdited: '1 day ago',
    status: 'Draft',
    category: 'Product',
    comments: 7,
    createdAt: '2026-02-01',
  },
  {
    id: 'doc-4',
    title: 'Brand guidelines',
    owner: 'David Kim',
    lastEdited: '3 days ago',
    status: 'Published',
    category: 'Design',
    comments: 2,
    createdAt: '2026-02-10',
  },
  {
    id: 'doc-5',
    title: 'Q4 planning notes',
    owner: 'Maya Chen',
    lastEdited: '1 week ago',
    status: 'Draft',
    category: 'Product',
    comments: 9,
    createdAt: '2026-03-01',
  },
  {
    id: 'doc-6',
    title: 'API integration guide',
    owner: 'Jon Bell',
    lastEdited: '2 weeks ago',
    status: 'Archived',
    category: 'Engineering',
    comments: 0,
    createdAt: '2026-01-05',
  },
  {
    id: 'doc-7',
    title: 'Enterprise pricing sheet',
    owner: 'Priya Sharma',
    lastEdited: '3 weeks ago',
    status: 'Published',
    category: 'Sales',
    comments: 3,
    createdAt: '2026-02-20',
  },
];

type DocFilter = 'All' | DocStatus;

interface DocsPageProps {
  preview?: PagePreviewState;
}

export function DocsPage({ preview }: DocsPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [docs, setDocs] = useState<IDoc[]>(INITIAL_DOCS);
  const [filter, setFilter] = useState<DocFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ICreateDocInput>({
    title: '',
    owner: '',
    status: 'Draft',
    category: 'Company',
  });

  const counts = useMemo(
    () => ({
      All: docs.length,
      Published: docs.filter((doc) => doc.status === 'Published').length,
      Draft: docs.filter((doc) => doc.status === 'Draft').length,
      Archived: docs.filter((doc) => doc.status === 'Archived').length,
    }),
    [docs],
  );

  const visibleDocs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return docs.filter((doc) => {
      const matchesFilter = filter === 'All' || doc.status === filter;
      const matchesQuery =
        !term ||
        doc.title.toLowerCase().includes(term) ||
        doc.owner.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [docs, filter, query]);

  function handleAddDoc(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.owner.trim()) return;

    const newDoc: IDoc = {
      id: `doc-${Date.now()}`,
      title: form.title.trim(),
      owner: form.owner.trim(),
      lastEdited: 'Just now',
      status: form.status ?? 'Draft',
      category: form.category ?? 'Company',
      comments: 0,
      createdAt: '2026-10-19',
    };

    setDocs((current) => [newDoc, ...current]);
    setForm({ title: '', owner: '', status: 'Draft', category: 'Company' });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
  }

  function setStatus(id: string, next: DocStatus) {
    setDocs((current) =>
      current.map((doc) =>
        doc.id === id ? { ...doc, status: next, lastEdited: 'Just now' } : doc,
      ),
    );
  }

  function removeDoc(id: string) {
    setDocs((current) => current.filter((doc) => doc.id !== id));
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="KNOWLEDGE"
        title="Docs"
        description="Write and share the documents that keep your team aligned."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Plus className="size-[18px]" />
            New document
          </button>
        }
      />

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Create new document"
            description="Start as a draft and publish it when the team is ready."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddDoc}
            submitLabel="Create document"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Document title" htmlFor="doc-title" className="sm:col-span-2">
                <input
                  id="doc-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="e.g. Team handbook"
                  className={inputClass}
                />
              </Field>
              <Field label="Owner" htmlFor="doc-owner">
                <input
                  id="doc-owner"
                  value={form.owner}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, owner: event.target.value }))
                  }
                  placeholder="Sarah Chen"
                  className={inputClass}
                />
              </Field>
              <Field label="Category" htmlFor="doc-category">
                <select
                  id="doc-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className={selectClass}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="doc-status">
                <select
                  id="doc-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as DocStatus,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Draft', 'Published', 'Archived'] as DocStatus[]).map((docStatus) => (
                    <option key={docStatus} value={docStatus}>
                      {docStatus}
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
          label="All documents"
          value={counts.All}
          hint="Across 5 categories"
          icon={FileText}
          tone="blue"
        />
        <StatCard
          label="Published"
          value={counts.Published}
          hint="Visible to the whole team"
          icon={BookOpen}
          tone="green"
        />
        <StatCard
          label="Drafts"
          value={counts.Draft}
          hint="Waiting for a reviewer"
          icon={PenLine}
          tone="amber"
        />
        <StatCard
          label="Open comments"
          value={docs.reduce((total, doc) => total + doc.comments, 0)}
          hint="Across all documents"
          icon={MessageSquare}
          tone="purple"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">All documents</h2>
            <p className="section-subtitle">
              {visibleDocs.length} of {docs.length} documents shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<DocFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Published', label: 'Published', count: counts.Published },
                { value: 'Draft', label: 'Drafts', count: counts.Draft },
                { value: 'Archived', label: 'Archived', count: counts.Archived },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search documents…"
              className="sm:w-56"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading documents…" rows={4} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your documents.'} onRetry={retry} />
        ) : visibleDocs.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={FileText}
            title={
              docs.length && preview !== 'empty'
                ? 'No documents match your filters'
                : 'No documents yet'
            }
            description={
              docs.length && preview !== 'empty'
                ? 'Try another search term or switch the status filter.'
                : 'Create the first document so your team has a single source of truth.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <Plus className="size-3.5" /> New document
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {visibleDocs.map((doc) => (
              <article
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-[#edf0f5] p-4 transition hover:border-[#ffb9bb] hover:shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ff] text-[#4e7cff]">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-[#172033]">{doc.title}</h3>
                      <span className="tag-chip bg-[#f4f6f9] text-[#8b96a9]">{doc.category}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#8b96a9]">
                      by {doc.owner} · edited {doc.lastEdited}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="inline-flex items-center gap-1 text-xs text-[#8b96a9]">
                    <MessageSquare className="size-3.5" />
                    {doc.comments}
                  </span>
                  <span className={cn('status-pill', statusTone[doc.status])}>{doc.status}</span>

                  <div className="flex items-center gap-1">
                    {doc.status === 'Draft' ? (
                      <button
                        type="button"
                        onClick={() => setStatus(String(doc.id), 'Published')}
                        className="soft-button"
                      >
                        <Send className="size-3.5" /> Publish
                      </button>
                    ) : doc.status === 'Published' ? (
                      <button
                        type="button"
                        onClick={() => setStatus(String(doc.id), 'Archived')}
                        className="soft-button"
                      >
                        <Archive className="size-3.5" /> Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatus(String(doc.id), 'Draft')}
                        className="soft-button"
                      >
                        <PenLine className="size-3.5" /> Restore
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDoc(String(doc.id))}
                      aria-label={`Delete ${doc.title}`}
                      className="soft-button px-2 hover:border-[#ff646b] hover:text-[#ff646b]"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default DocsPage;
