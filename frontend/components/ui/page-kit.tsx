import type { ComponentType, FormEvent, ReactNode } from 'react';
import { AlertTriangle, Archive, Edit2, Inbox, RefreshCw, Search, Trash2, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { IClient } from '@/lib/types';

/** Shared input styling — every page form uses the same look. */
export const inputClass =
  'w-full rounded-xl border border-[#e5e9f1] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition placeholder:text-[#b6bfcd] focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10';

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
      <label htmlFor={htmlFor} className="text-xs font-semibold text-[#172033]">
        {label}
      </label>
      {children}
      {hint ? <span className="text-[11px] font-medium text-[#b6bfcd]">{hint}</span> : null}
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
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a3adbc]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(inputClass, 'pl-9')}
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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              active
                ? 'border-[#ff646b] bg-[#fff0f0] text-[#ff646b] shadow-sm shadow-[#ff646b]/15'
                : 'border-[#e7ebf2] bg-white text-[#7f8a9e] hover:border-[#ffb9bb] hover:text-[#ff646b] hover:bg-[#fbfcff]',
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  active ? 'bg-white text-[#ff646b]' : 'bg-[#f4f6f9] text-[#8b96a9]',
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
  blue: 'bg-[#edf3ff] text-[#4e7cff] shadow-[0_0_20px_rgba(78,124,255,0.2)]',
  green: 'bg-[#eafaf3] text-[#25a66a] shadow-[0_0_20px_rgba(37,166,106,0.2)]',
  coral: 'bg-[#fff0f0] text-[#ff646b] shadow-[0_0_20px_rgba(255,100,107,0.2)]',
  amber: 'bg-[#fff6e5] text-[#d98a12] shadow-[0_0_20px_rgba(217,138,18,0.2)]',
  purple: 'bg-[#f2efff] text-[#7d5cf0] shadow-[0_0_20px_rgba(125,92,240,0.2)]',
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
  tone = 'blue',
  trend,
}: StatCardProps) {
  return (
    <div className="stat-card stat-card-gradient animate-slide-in">
      <span className={cn('stat-icon', statToneClass[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#8b96a9]">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <p className="text-xl font-bold tracking-[-0.02em] text-[#172033]">{value}</p>
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold',
                trend.positive ? 'text-[#25a66a]' : 'text-[#ff646b]',
              )}
            >
              {trend.positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
        {hint ? <p className="mt-0.5 truncate text-[11px] text-[#aeb9cc]">{hint}</p> : null}
      </div>
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
    Active: 'status-green',
    Pending: 'status-amber',
    Inactive: 'status-muted',
  };
  const planTone: Record<string, string> = {
    Starter: 'status-muted',
    Growth: 'status-blue',
    Enterprise: 'status-purple',
  };
  return (
    <article className="client-card group">
      <div className="client-avatar-ring">
        <div className="client-avatar-inner">
          {client.company.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div>
        <h3 className="text-base font-bold text-[#172033] leading-tight">{client.company}</h3>
        {client.contactName && (
          <p className="mt-0.5 text-sm text-[#566176]">{client.contactName}</p>
        )}
        <p className="mt-1 text-[11px] text-[#aeb9cc]">{client.email ?? 'No email'}</p>
      </div>
      <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t border-[#f4f6f9]">
        <span className={cn('status-pill', statusTone[client.status] || 'status-muted')}>
          {client.status}
        </span>
        <span className={cn('status-pill', planTone[client.plan] || 'status-muted')}>
          {client.plan}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#172033]">${client.value.toLocaleString()}/mo</span>
        <span className="text-xs text-[#8b96a9]">{client.projects} project{client.projects !== 1 ? 's' : ''}</span>
      </div>
      <div className="mt-4 flex gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(client)}
            className="flex size-9 items-center justify-center rounded-lg border border-[#e5e9f1] bg-white text-[#8b96a9] hover:bg-[#f6f8fc] hover:text-[#172033] transition-all"
            aria-label="Edit client"
          >
            <Edit2 className="size-4" />
          </button>
        )}
        {onArchive && (
          <button
            type="button"
            onClick={() => onArchive(client.id)}
            className="flex size-9 items-center justify-center rounded-lg border border-[#e5e9f1] bg-white text-[#8b96a9] hover:bg-[#fff0f0] hover:text-[#ff646b] transition-all"
            aria-label="Archive client"
          >
            <Archive className="size-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(client.id)}
            className="flex size-9 items-center justify-center rounded-lg border border-[#e5e9f1] bg-white text-[#8b96a9] hover:bg-[#fff0f0] hover:text-[#ff646b] transition-all"
            aria-label="Delete client"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </article>
  );
}
