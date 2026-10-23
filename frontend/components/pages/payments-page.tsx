'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Receipt,
  Send,
  Wallet,
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
  InvoiceStatus,
  ICreatePaymentInput,
  IPayment,
  PagePreviewState,
  PaymentMethod,
} from '@/lib/types';

const statusTone: Record<InvoiceStatus, string> = {
  Paid: 'status-green',
  Pending: 'status-amber',
  Overdue: 'status-red',
};

const INITIAL_INVOICES: IPayment[] = [
  {
    id: 'invoice-1',
    invoiceNumber: 'INV-001',
    client: 'Northstar Studio',
    amount: 4500,
    status: 'Paid',
    dueDate: '2026-10-10',
    issuedDate: '2026-09-25',
    method: 'Bank transfer',
    paidDate: '2026-10-09',
    createdAt: '2026-09-25',
  },
  {
    id: 'invoice-2',
    invoiceNumber: 'INV-002',
    client: 'Brightline Labs',
    amount: 8200,
    status: 'Pending',
    dueDate: '2026-10-25',
    issuedDate: '2026-10-01',
    method: 'Card',
    paidDate: null,
    createdAt: '2026-10-01',
  },
  {
    id: 'invoice-3',
    invoiceNumber: 'INV-003',
    client: 'Cedar & Co.',
    amount: 3200,
    status: 'Overdue',
    dueDate: '2026-10-15',
    issuedDate: '2026-09-30',
    method: 'PayPal',
    paidDate: null,
    createdAt: '2026-09-30',
  },
  {
    id: 'invoice-4',
    invoiceNumber: 'INV-004',
    client: 'Summit Works',
    amount: 12500,
    status: 'Paid',
    dueDate: '2026-10-05',
    issuedDate: '2026-09-20',
    method: 'Bank transfer',
    paidDate: '2026-10-04',
    createdAt: '2026-09-20',
  },
  {
    id: 'invoice-5',
    invoiceNumber: 'INV-005',
    client: 'Nexus Digital',
    amount: 6700,
    status: 'Pending',
    dueDate: '2026-10-30',
    issuedDate: '2026-10-02',
    method: 'Stripe',
    paidDate: null,
    createdAt: '2026-10-02',
  },
  {
    id: 'invoice-6',
    invoiceNumber: 'INV-006',
    client: 'Halcyon Group',
    amount: 1800,
    status: 'Paid',
    dueDate: '2026-10-12',
    issuedDate: '2026-09-28',
    method: 'Card',
    paidDate: '2026-10-11',
    createdAt: '2026-09-28',
  },
];

const MONTHLY_REVENUE = [
  { month: 'May', revenue: 16800 },
  { month: 'Jun', revenue: 21400 },
  { month: 'Jul', revenue: 19200 },
  { month: 'Aug', revenue: 24600 },
  { month: 'Sep', revenue: 28300 },
  { month: 'Oct', revenue: 21700 },
];

const CLIENT_NAMES = [
  'Northstar Studio',
  'Brightline Labs',
  'Cedar & Co.',
  'Summit Works',
  'Nexus Digital',
  'Halcyon Group',
];

type InvoiceFilter = 'All' | InvoiceStatus;

interface PaymentsPageProps {
  preview?: PagePreviewState;
}

export function PaymentsPage({ preview }: PaymentsPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [invoices, setInvoices] = useState<IPayment[]>(INITIAL_INVOICES);
  const [filter, setFilter] = useState<InvoiceFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ICreatePaymentInput>({
    invoiceNumber: '',
    client: '',
    amount: 0,
    status: 'Pending',
    dueDate: '',
    method: 'Bank transfer',
  });

  const totals = useMemo(() => {
    const sum = (items: IPayment[]) => items.reduce((total, item) => total + item.amount, 0);
    const paid = invoices.filter((invoice) => invoice.status === 'Paid');
    const pending = invoices.filter((invoice) => invoice.status === 'Pending');
    const overdue = invoices.filter((invoice) => invoice.status === 'Overdue');
    return {
      revenue: sum(invoices),
      paid: sum(paid),
      pending: sum(pending),
      overdue: sum(overdue),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }, [invoices]);

  const visibleInvoices = useMemo(() => {
    const term = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesFilter = filter === 'All' || invoice.status === filter;
      const matchesQuery =
        !term ||
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.client.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [invoices, filter, query]);

  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((item) => item.revenue));

  function handleAddInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.invoiceNumber.trim() || !form.client.trim() || !form.dueDate) return;

    const newInvoice: IPayment = {
      id: `invoice-${Date.now()}`,
      invoiceNumber: form.invoiceNumber.trim(),
      client: form.client.trim(),
      amount: Number(form.amount) || 0,
      status: form.status ?? 'Pending',
      dueDate: form.dueDate,
      issuedDate: '2026-10-19',
      method: form.method ?? 'Bank transfer',
      paidDate: form.status === 'Paid' ? '2026-10-19' : null,
      createdAt: '2026-10-19',
    };

    setInvoices((current) => [newInvoice, ...current]);
    setForm({
      invoiceNumber: '',
      client: '',
      amount: 0,
      status: 'Pending',
      dueDate: '',
      method: 'Bank transfer',
    });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
    setNotice(`Invoice ${newInvoice.invoiceNumber} sent to ${newInvoice.client}.`);
  }

  function markAsPaid(id: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === id
          ? { ...invoice, status: 'Paid' as InvoiceStatus, paidDate: '2026-10-19' }
          : invoice,
      ),
    );
    const invoice = invoices.find((item) => item.id === id);
    if (invoice) setNotice(`${invoice.invoiceNumber} marked as paid.`);
  }

  function sendReminder(id: string) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice) return;
    setNotice(`Reminder sent to ${invoice.client} about ${invoice.invoiceNumber}.`);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="FINANCE"
        title="Payments"
        description="Track invoices, revenue, and payment activity."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <Send className="size-[18px]" />
            Send invoice
          </button>
        }
      />

      {notice ? (
        <div
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl border border-[#c9f0dc] bg-[#eafaf3] px-4 py-3 text-sm font-medium text-[#25a66a]"
        >
          <CheckCircle2 className="size-4" />
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
            title="Send new invoice"
            description="The client receives the invoice by email with a payment link."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleAddInvoice}
            submitLabel="Send invoice"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice number" htmlFor="invoice-number">
                <input
                  id="invoice-number"
                  value={form.invoiceNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, invoiceNumber: event.target.value }))
                  }
                  placeholder="INV-007"
                  className={inputClass}
                />
              </Field>
              <Field label="Client" htmlFor="invoice-client">
                <select
                  id="invoice-client"
                  value={form.client}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, client: event.target.value }))
                  }
                  className={selectClass}
                >
                  <option value="">Select a client</option>
                  {CLIENT_NAMES.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Amount ($)" htmlFor="invoice-amount">
                <input
                  id="invoice-amount"
                  type="number"
                  min={0}
                  step={50}
                  value={form.amount || ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: Number(event.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
              <Field label="Due date" htmlFor="invoice-due">
                <input
                  id="invoice-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Payment method" htmlFor="invoice-method">
                <select
                  id="invoice-method"
                  value={form.method}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      method: event.target.value as PaymentMethod,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Bank transfer', 'Card', 'PayPal', 'Stripe'] as PaymentMethod[]).map(
                    (method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Status" htmlFor="invoice-status">
                <select
                  id="invoice-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as InvoiceStatus,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Pending', 'Paid', 'Overdue'] as InvoiceStatus[]).map((invoiceStatus) => (
                    <option key={invoiceStatus} value={invoiceStatus}>
                      {invoiceStatus}
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
          label="Total revenue"
          value={`$${totals.revenue.toLocaleString()}`}
          hint="All invoices this quarter"
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          label="Collected"
          value={`$${totals.paid.toLocaleString()}`}
          hint={`${totals.paidCount} invoices paid`}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Awaiting payment"
          value={`$${totals.pending.toLocaleString()}`}
          hint={`${totals.pendingCount} invoices in flight`}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Overdue"
          value={`$${totals.overdue.toLocaleString()}`}
          hint={`${totals.overdueCount} invoice needs chasing`}
          icon={Receipt}
          tone="coral"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel lg:col-span-2">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Revenue</h2>
              <p className="section-subtitle">Collected over the last 6 months</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#25a66a]">
              <ArrowUpRight className="size-3.5" /> 8.4%
            </span>
          </div>

          <div className="flex h-48 items-end gap-3 sm:gap-5">
            {MONTHLY_REVENUE.map((item) => {
              const height = Math.round((item.revenue / maxRevenue) * 100);
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#7f8a9e]">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-[#edf3ff] transition-all hover:bg-[#4e7cff]"
                    style={{ height: `${height}%` }}
                    title={`${item.month}: $${item.revenue.toLocaleString()}`}
                  />
                  <span className="text-[11px] font-medium text-[#a3adbc]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Cash flow</h2>
              <p className="section-subtitle">Where the money sits right now</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-[#566176]">Collected</span>
                <span className="font-semibold text-[#172033]">
                  ${totals.paid.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0f5]">
                <div
                  className="h-full rounded-full bg-[#25a66a]"
                  style={{ width: `${totals.revenue ? (totals.paid / totals.revenue) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-[#566176]">Awaiting payment</span>
                <span className="font-semibold text-[#172033]">
                  ${totals.pending.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0f5]">
                <div
                  className="h-full rounded-full bg-[#d98a12]"
                  style={{
                    width: `${totals.revenue ? (totals.pending / totals.revenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-[#566176]">Overdue</span>
                <span className="font-semibold text-[#172033]">
                  ${totals.overdue.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0f5]">
                <div
                  className="h-full rounded-full bg-[#ff646b]"
                  style={{
                    width: `${totals.revenue ? (totals.overdue / totals.revenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-[#f4f6f9] pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#7f8a9e]">
                <CreditCard className="size-4 text-[#a3adbc]" /> Next payout
              </span>
              <span className="font-semibold text-[#172033]">Oct 24 · $9,900</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#7f8a9e]">
                <ArrowDownRight className="size-4 text-[#a3adbc]" /> Outstanding
              </span>
              <span className="font-semibold text-[#172033]">
                ${(totals.pending + totals.overdue).toLocaleString()}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">Invoices</h2>
            <p className="section-subtitle">
              {visibleInvoices.length} of {invoices.length} invoices shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<InvoiceFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: invoices.length },
                { value: 'Paid', label: 'Paid', count: totals.paidCount },
                { value: 'Pending', label: 'Pending', count: totals.pendingCount },
                { value: 'Overdue', label: 'Overdue', count: totals.overdueCount },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search invoices…"
              className="sm:w-56"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading invoices…" rows={4} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load your invoices.'} onRetry={retry} />
        ) : visibleInvoices.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={Receipt}
            title={
              invoices.length && preview !== 'empty'
                ? 'No invoices match your filters'
                : 'No invoices yet'
            }
            description={
              invoices.length && preview !== 'empty'
                ? 'Try another search term or switch the status filter.'
                : 'Send your first invoice to start tracking revenue for this workspace.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <Send className="size-3.5" /> Send invoice
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#edf0f5]">
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Invoice</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Client</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Issued</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Due</th>
                  <th className="pb-3 text-right text-xs font-semibold text-[#566176]">Amount</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Status</th>
                  <th className="pb-3 text-right text-xs font-semibold text-[#566176]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-[#f4f6f9] transition hover:bg-[#f8faff]"
                  >
                    <td className="py-4 text-sm font-semibold text-[#172033]">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-4 text-sm text-[#566176]">{invoice.client}</td>
                    <td className="py-4 text-sm text-[#8b96a9]">{invoice.issuedDate}</td>
                    <td className="py-4 text-sm text-[#8b96a9]">{invoice.dueDate}</td>
                    <td className="py-4 text-right text-sm font-semibold text-[#172033]">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={cn('status-pill', statusTone[invoice.status])}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'Paid' ? (
                          <button type="button" className="soft-button">
                            <Download className="size-3.5" /> Receipt
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => sendReminder(String(invoice.id))}
                              className="soft-button"
                            >
                              <BellRing className="size-3.5" />
                              {invoice.status === 'Overdue' ? 'Chase' : 'Remind'}
                            </button>
                            <button
                              type="button"
                              onClick={() => markAsPaid(String(invoice.id))}
                              className="soft-button border-[#c9f0dc] text-[#25a66a] hover:border-[#25a66a] hover:text-[#25a66a]"
                            >
                              <CheckCircle2 className="size-3.5" /> Mark paid
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TaskflowShell>
  );
}

export default PaymentsPage;
