import type { ComponentType, FormEvent, ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  Edit2,
  Inbox,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { IClient } from '@/lib/types';

/** Shared input styling — every page form uses the same look. */
export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6355ff] focus:ring-4 focus:ring-[#6355ff]/10';

export const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%237f8a9e%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`;

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-800">
        {label}
      </label>
      {children}
      {hint ? <span className="text-[11px] font-medium text-slate-400">{hint}</span> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(inputClass, 'pl-9 bg-white')}
      />
    </div>
  );
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
              active
                ? 'border-transparent bg-[#6355ff] text-white shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export type StatTone = 'blue' | 'green' | 'coral' | 'amber' | 'purple';

const statToneClass: Record<StatTone, string> = {
  blue: 'bg-[#edf3ff] text-[#4e7cff]',
  green: 'bg-[#e8faf0] text-[#10b981]',
  coral: 'bg-[#feebeb] text-[#f43f5e]',
  amber: 'bg-[#fff8eb] text-[#d97706]',
  purple: 'bg-[#f0efff] text-[#6355ff]',
};

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: StatTone;
  trend?: { value: string; positive: boolean };
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'purple',
  trend,
}: StatCardProps) {
  return (
    <div className="stat-card">
      {/* Top Header: Icon + Label + More Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn('stat-icon', statToneClass[tone])}>
            <Icon className="size-4" />
          </span>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Main Stat & Trend Pill */}
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              trend.positive
                ? 'bg-[#e8faf0] text-[#10b981]'
                : 'bg-[#feebeb] text-[#f43f5e]',
            )}
          >
            {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      {hint ? <p className="mt-1 truncate text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function PageLoading({
  label = 'Loading workspace data…',
  rows = 4,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <section className="panel" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="skeleton size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-1/3 rounded-full" />
              <div className="skeleton h-2.5 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <p role="status" className="mt-4 text-xs font-medium text-[#8b96a9]">
        {label}
      </p>
    </section>
  );
}

export function PageError({
  title = 'We could not load this page',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <section role="alert" className="panel border-[#ffd3d5]">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
          <AlertTriangle className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[#172033]">{title}</h2>
          <p className="mt-1 text-sm text-[#7f8a9e]">{message}</p>
        </div>
        <button type="button" onClick={onRetry} className="soft-button">
          <RefreshCw className="size-3.5" /> Try again
        </button>
      </div>
    </section>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e5e9f1] bg-[#fbfcff] px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-[#edf3ff] text-[#4e7cff]">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-[#172033]">{title}</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-[#8b96a9]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function FormShell({
  title,
  description,
  onCancel,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  children,
}: {
  title: string;
  description?: string;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="panel border-[#ffd9db]">
      <div className="panel-heading">
        <div>
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-subtitle">{description}</p> : null}
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate>
        {children}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="soft-button">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="primary-button">
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export function Toast({
  type = 'success',
  title,
  message,
  onClose,
}: {
  type?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}) {
  const toneClass: Record<string, string> = {
    success: 'toast-success text-[#25a66a]',
    error: 'toast-error text-[#ff646b]',
    info: 'toast-info text-[#4e7cff]',
  };
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Inbox,
  };
  const Icon = iconMap[type];
  return (
    <div className={cn('toast', toneClass[type])} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="flex shrink-0 size-9 items-center justify-center rounded-lg bg-[rgba(0,0,0,0.05)]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#172033]">{title}</p>
          {message ? <p className="mt-0.5 text-xs text-[#7f8a9e]">{message}</p> : null}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-[11px] text-[#aeb9cc] hover:text-[#172033]">
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ClientCard({
  client,
  onEdit,
  onArchive,
  onDelete,
}: {
  client: IClient;
  onEdit?: (client: IClient) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const statusTone: Record<string, string> = {
    Active: 'status-subscribed',
    Pending: 'status-amber',
    Inactive: 'status-unsubscribed',
  };
  const planTone: Record<string, string> = {
    Starter: 'status-muted',
    Growth: 'status-blue',
    Enterprise: 'status-purple',
  };
  return (
    <div className="client-card group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#f0efff] text-[#6355ff] text-sm font-bold shadow-2xs">
            {client.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{client.company}</h3>
            {client.contactName && (
              <p className="text-xs text-slate-500 truncate">{client.contactName}</p>
            )}
            <p className="text-[11px] text-slate-400 truncate">{client.email ?? 'No email'}</p>
          </div>
        </div>

        <span className={cn('status-pill text-xs font-medium', statusTone[client.status] || 'status-muted')}>
          {client.status === 'Active' ? 'Subscribed' : client.status === 'Inactive' ? 'Unsubscribed' : client.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-semibold text-slate-900">${client.value.toLocaleString()}/mo</span>
        <span className="text-slate-500">{client.projects} project{client.projects !== 1 ? 's' : ''}</span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 pt-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(client)}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#6355ff] hover:text-[#6355ff] transition"
            aria-label="Edit client"
          >
            <Edit2 className="size-3.5" />
          </button>
        )}
        {onArchive && (
          <button
            type="button"
            onClick={() => onArchive(client.id)}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
            aria-label="Archive client"
          >
            <Archive className="size-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(client.id)}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#eb5757] hover:text-[#eb5757] hover:bg-[#fff5f5] transition"
            aria-label="Delete client"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
