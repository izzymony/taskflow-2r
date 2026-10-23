'use client';

import { useMemo, useState, type ElementType, type FormEvent } from 'react';
import {
  Download,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  Presentation,
  Share2,
  Trash2,
  Upload,
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
import type { FileType, ICreateFileInput, IFile, PagePreviewState } from '@/lib/types';

const fileIcon: Record<FileType, ElementType> = {
  Document: FileText,
  Image: ImageIcon,
  Spreadsheet: FileSpreadsheet,
  Presentation: Presentation,
  PDF: FileIcon,
  Other: Folder,
};

const fileTone: Record<FileType, string> = {
  Document: 'bg-[#edf3ff] text-[#4e7cff]',
  Image: 'bg-[#f2efff] text-[#7d5cf0]',
  Spreadsheet: 'bg-[#eafaf3] text-[#25a66a]',
  Presentation: 'bg-[#fff6e5] text-[#d98a12]',
  PDF: 'bg-[#fff0f0] text-[#ff646b]',
  Other: 'bg-[#f4f6f9] text-[#8b96a9]',
};

const FOLDERS = ['Design', 'Finance', 'Marketing', 'Legal'];

const INITIAL_FILES: IFile[] = [
  {
    id: 'file-1',
    name: 'Q4 product roadmap.pdf',
    type: 'PDF',
    size: '2.4 MB',
    modified: '2 hours ago',
    owner: 'Sarah Chen',
    folder: 'Design',
  },
  {
    id: 'file-2',
    name: 'Campaign performance.xlsx',
    type: 'Spreadsheet',
    size: '1.1 MB',
    modified: '5 hours ago',
    owner: 'Marcus Reed',
    folder: 'Marketing',
  },
  {
    id: 'file-3',
    name: 'Brand guidelines.docx',
    type: 'Document',
    size: '856 KB',
    modified: '1 day ago',
    owner: 'Aisha Patel',
    folder: 'Design',
  },
  {
    id: 'file-4',
    name: 'Team photo.jpg',
    type: 'Image',
    size: '3.2 MB',
    modified: '3 days ago',
    owner: 'David Kim',
    folder: 'Marketing',
  },
  {
    id: 'file-5',
    name: 'Q3 pitch deck.pptx',
    type: 'Presentation',
    size: '5.8 MB',
    modified: '1 week ago',
    owner: 'Maya Chen',
    folder: 'Marketing',
  },
  {
    id: 'file-6',
    name: 'API documentation.pdf',
    type: 'PDF',
    size: '1.9 MB',
    modified: '2 weeks ago',
    owner: 'Jon Bell',
    folder: 'Legal',
  },
  {
    id: 'file-7',
    name: 'Payroll summary.xlsx',
    type: 'Spreadsheet',
    size: '640 KB',
    modified: '3 weeks ago',
    owner: 'Priya Sharma',
    folder: 'Finance',
  },
  {
    id: 'file-8',
    name: 'Service agreement.pdf',
    type: 'PDF',
    size: '2.9 MB',
    modified: '1 month ago',
    owner: 'Jon Bell',
    folder: 'Legal',
  },
];

type FileFilter = 'All' | FileType;

interface FilesPageProps {
  preview?: PagePreviewState;
}

export function FilesPage({ preview }: FilesPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [files, setFiles] = useState<IFile[]>(INITIAL_FILES);
  const [folder, setFolder] = useState<string>('All');
  const [filter, setFilter] = useState<FileFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ICreateFileInput>({
    name: '',
    type: 'Document',
    size: '',
    owner: '',
    folder: 'Design',
  });

  const folderStats = useMemo(
    () =>
      FOLDERS.map((name) => {
        const items = files.filter((file) => file.folder === name);
        return { name, count: items.length, latest: items[0]?.modified ?? '—' };
      }),
    [files],
  );

  const visibleFiles = useMemo(() => {
    const term = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchesFolder = folder === 'All' || file.folder === folder;
      const matchesType = filter === 'All' || file.type === filter;
      const matchesQuery =
        !term || file.name.toLowerCase().includes(term) || file.owner.toLowerCase().includes(term);
      return matchesFolder && matchesType && matchesQuery;
    });
  }, [files, filter, folder, query]);

  const storage = useMemo(() => {
    const toGb = (size: string) => {
      const value = Number.parseFloat(size) || 0;
      return size.toLowerCase().includes('kb') ? value / 1_000_000 : value / 1_000;
    };
    const used = files.reduce((total, file) => total + toGb(file.size), 0);
    return { used, limit: 50 };
  }, [files]);

  function handleAddFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.size.trim() || !form.owner.trim()) return;

    const newFile: IFile = {
      id: `file-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      size: form.size.trim(),
      modified: 'Just now',
      owner: form.owner.trim(),
      folder: form.folder ?? 'Design',
    };

    setFiles((current) => [newFile, ...current]);
    setForm({ name: '', type: 'Document', size: '', owner: '', folder: 'Design' });
    setIsAdding(false);
    setFolder('All');
    setFilter('All');
    setQuery('');
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id));
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="KNOWLEDGE"
        title="Company files"
        description="A single home for shared files, folders, and company documents."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Upload className="size-[18px]" />
            Upload file
          </button>
        }
      />

      {isAdding ? (
        <div className="mb-6">
          <FormShell
            title="Upload new file"
            description="Everyone with access to the workspace can open and share it."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddFile}
            submitLabel="Upload file"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="File name" htmlFor="file-name" className="sm:col-span-2">
                <input
                  id="file-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="project-proposal.pdf"
                  className={inputClass}
                />
              </Field>
              <Field label="File type" htmlFor="file-type">
                <select
                  id="file-type"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as FileType }))
                  }
                  className={selectClass}
                >
                  {(
                    ['Document', 'Image', 'Spreadsheet', 'Presentation', 'PDF', 'Other'] as FileType[]
                  ).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Folder" htmlFor="file-folder">
                <select
                  id="file-folder"
                  value={form.folder ?? 'Design'}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, folder: event.target.value }))
                  }
                  className={selectClass}
                >
                  {FOLDERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Size" htmlFor="file-size">
                <input
                  id="file-size"
                  value={form.size}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, size: event.target.value }))
                  }
                  placeholder="2.4 MB"
                  className={inputClass}
                />
              </Field>
              <Field label="Owner" htmlFor="file-owner">
                <input
                  id="file-owner"
                  value={form.owner}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, owner: event.target.value }))
                  }
                  placeholder="Sarah Chen"
                  className={inputClass}
                />
              </Field>
            </div>
          </FormShell>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total files"
          value={files.length}
          hint={`Across ${FOLDERS.length} folders`}
          icon={FolderOpen}
          tone="blue"
        />
        <StatCard
          label="Storage used"
          value={`${storage.used.toFixed(1)} GB`}
          hint={`of ${storage.limit} GB included`}
          icon={HardDrive}
          tone="purple"
        />
        <StatCard
          label="Updated this week"
          value={files.filter((file) => !file.modified.includes('month')).length}
          hint="Files touched in the last 7 days"
          icon={FileText}
          tone="green"
        />
        <StatCard
          label="Shared externally"
          value={3}
          hint="Links open to clients"
          icon={Share2}
          tone="amber"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading">
          <div>
            <h2 className="section-title">Folders</h2>
            <p className="section-subtitle">Jump into a folder to narrow the file list</p>
          </div>
          <button
            type="button"
            onClick={() => setFolder('All')}
            className={cn('soft-button', folder === 'All' && 'border-[#ff646b] text-[#ff646b]')}
          >
            All files
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {folderStats.map((item) => {
            const active = folder === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setFolder(active ? 'All' : item.name)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                  active
                    ? 'border-[#ff646b] bg-[#fff0f0]'
                    : 'border-[#edf0f5] bg-white hover:border-[#ffb9bb]',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    active ? 'bg-white text-[#ff646b]' : 'bg-[#f8faff] text-[#4e7cff]',
                  )}
                >
                  <Folder className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#172033]">
                    {item.name}
                  </span>
                  <span className="block text-xs text-[#8b96a9]">
                    {item.count} files · {item.latest}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl bg-[#f8faff] p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-[#566176]">Storage</span>
            <span className="font-semibold text-[#172033]">
              {storage.used.toFixed(1)} GB of {storage.limit} GB
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0f5]">
            <div
              className="h-full rounded-full bg-[#4e7cff]"
              style={{ width: `${Math.min(100, (storage.used / storage.limit) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">All files</h2>
            <p className="section-subtitle">
              {visibleFiles.length} of {files.length} files shown
              {folder !== 'All' ? ` · ${folder}` : ''}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<FileFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: files.length },
                { value: 'PDF', label: 'PDF' },
                { value: 'Document', label: 'Docs' },
                { value: 'Spreadsheet', label: 'Sheets' },
                { value: 'Image', label: 'Images' },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search files…"
              className="sm:w-52"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading your files…" rows={4} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your files.'} onRetry={retry} />
        ) : visibleFiles.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={FolderOpen}
            title={
              files.length && preview !== 'empty' ? 'No files match your filters' : 'No files yet'
            }
            description={
              files.length && preview !== 'empty'
                ? 'Try another search term, pick a different folder, or reset the type filter.'
                : 'Upload the first file so your team has one place to find everything.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <Upload className="size-3.5" /> Upload file
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#edf0f5]">
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Name</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Folder</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Size</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Modified</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Owner</th>
                  <th className="pb-3 text-right text-xs font-semibold text-[#566176]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleFiles.map((file) => {
                  const Icon = fileIcon[file.type];
                  return (
                    <tr
                      key={file.id}
                      className="border-b border-[#f4f6f9] transition hover:bg-[#f8faff]"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-lg',
                              fileTone[file.type],
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="truncate text-sm font-medium text-[#172033]">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-[#566176]">{file.folder}</td>
                      <td className="py-3 text-sm text-[#8b96a9]">{file.size}</td>
                      <td className="py-3 text-sm text-[#8b96a9]">{file.modified}</td>
                      <td className="py-3 text-sm text-[#566176]">{file.owner}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Download ${file.name}`}
                            className="soft-button px-2"
                          >
                            <Download className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Share ${file.name}`}
                            className="soft-button px-2"
                          >
                            <Share2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(String(file.id))}
                            aria-label={`Delete ${file.name}`}
                            className="soft-button px-2 hover:border-[#ff646b] hover:text-[#ff646b]"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default FilesPage;
