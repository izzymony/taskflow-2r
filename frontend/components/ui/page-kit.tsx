import type { ComponentType, FormEvent, ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

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
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              active
                ? 'border-[#ff646b] bg-[#fff0f0] text-[#ff646b]'
                : 'border-[#e7ebf2] bg-white text-[#7f8a9e] hover:border-[#ffb9bb] hover:text-[#ff646b]',
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
  blue: 'bg-[#edf3ff] text-[#4e7cff]',
  green: 'bg-[#eafaf3] text-[#25a66a]',
  coral: 'bg-[#fff0f0] text-[#ff646b]',
  amber: 'bg-[#fff6e5] text-[#d98a12]',
  purple: 'bg-[#f2efff] text-[#7d5cf0]',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: StatTone;
}) {
  return (
    <div className="stat-card">
      <span className={cn('stat-icon', statToneClass[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#8b96a9]">{label}</p>
        <p className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#172033]">{value}</p>
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
