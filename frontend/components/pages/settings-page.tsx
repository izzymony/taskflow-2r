'use client';

import { useState, type FormEvent } from 'react';
import {
  Bell,
  CheckCircle2,
  Download,
  Globe,
  Palette,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

import { PageHeader, TaskflowShell } from '../taskflow-shell';
import { Field, inputClass, selectClass } from '@/components/ui/page-kit';
import { cn } from '@/lib/utils';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#172033]">{label}</p>
        <p className="mt-0.5 text-xs text-[#8b96a9]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-[#25a66a]' : 'bg-[#dfe4ec]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: 'Taskflow Studio',
    slug: 'taskflow-studio',
    timezone: '(GMT+03:00) Nairobi',
    language: 'English (United States)',
  });
  const [notifications, setNotifications] = useState({
    assigned: true,
    mentions: true,
    invoicePaid: false,
    digest: true,
  });
  const [appearance, setAppearance] = useState({
    theme: 'Light',
    density: 'Comfortable',
    compact: false,
  });

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Workspace settings saved.');
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="SETTINGS"
        title="Workspace settings"
        description="Manage the workspace profile, notifications, and appearance."
        action={
          <button type="submit" form="settings-form" className="primary-button">
            <Save className="size-[18px]" />
            Save changes
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

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Workspace profile</h2>
              <p className="section-subtitle">How your workspace appears to your team</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#4e7cff]">
              <Globe className="size-5" />
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Workspace name" htmlFor="settings-name">
              <input
                id="settings-name"
                value={profile.name}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Workspace URL" htmlFor="settings-slug" hint="taskflow.app/">
              <input
                id="settings-slug"
                value={profile.slug}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, slug: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Timezone" htmlFor="settings-timezone">
              <select
                id="settings-timezone"
                value={profile.timezone}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, timezone: event.target.value }))
                }
                className={selectClass}
              >
                {[
                  '(GMT+03:00) Nairobi',
                  '(GMT+00:00) London',
                  '(GMT-05:00) New York',
                  '(GMT-08:00) Los Angeles',
                ].map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Language" htmlFor="settings-language">
              <select
                id="settings-language"
                value={profile.language}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, language: event.target.value }))
                }
                className={selectClass}
              >
                {['English (United States)', 'English (United Kingdom)', 'Spanish', 'French'].map(
                  (language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ),
                )}
              </select>
            </Field>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Notifications</h2>
              <p className="section-subtitle">Choose what the workspace sends you</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
              <Bell className="size-5" />
            </span>
          </div>

          <div className="divide-y divide-[#f4f6f9]">
            <Toggle
              label="Task assigned to me"
              description="Get an email and a notification when work lands in your inbox."
              checked={notifications.assigned}
              onChange={(checked) =>
                setNotifications((current) => ({ ...current, assigned: checked }))
              }
            />
            <Toggle
              label="Mentions and replies"
              description="Know the moment somebody mentions you in a comment."
              checked={notifications.mentions}
              onChange={(checked) =>
                setNotifications((current) => ({ ...current, mentions: checked }))
              }
            />
            <Toggle
              label="Invoice paid"
              description="Know as soon as a client settles an invoice."
              checked={notifications.invoicePaid}
              onChange={(checked) =>
                setNotifications((current) => ({ ...current, invoicePaid: checked }))
              }
            />
            <Toggle
              label="Weekly digest"
              description="A Monday summary of deadlines, overdue work, and revenue."
              checked={notifications.digest}
              onChange={(checked) =>
                setNotifications((current) => ({ ...current, digest: checked }))
              }
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Appearance</h2>
              <p className="section-subtitle">Make taskflow feel at home on your screen</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#f2efff] text-[#7d5cf0]">
              <Palette className="size-5" />
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Theme" htmlFor="settings-theme">
              <select
                id="settings-theme"
                value={appearance.theme}
                onChange={(event) =>
                  setAppearance((current) => ({ ...current, theme: event.target.value }))
                }
                className={selectClass}
              >
                {['Light', 'Dark', 'System'].map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Density" htmlFor="settings-density">
              <select
                id="settings-density"
                value={appearance.density}
                onChange={(event) =>
                  setAppearance((current) => ({ ...current, density: event.target.value }))
                }
                className={selectClass}
              >
                {['Comfortable', 'Compact'].map((density) => (
                  <option key={density} value={density}>
                    {density}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-2 divide-y divide-[#f4f6f9]">
            <Toggle
              label="Compact tables"
              description="Show more rows per page by tightening the row spacing."
              checked={appearance.compact}
              onChange={(checked) =>
                setAppearance((current) => ({ ...current, compact: checked }))
              }
            />
          </div>
        </section>

        <section className="panel border-[#ffd3d5]">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">Danger zone</h2>
              <p className="section-subtitle">These actions affect the whole workspace</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
              <ShieldAlert className="size-5" />
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#172033]">Export workspace data</p>
              <p className="mt-0.5 text-xs text-[#8b96a9]">
                Download a copy of your tasks, clients, invoices, and documents.
              </p>
            </div>
            <button type="button" className="soft-button shrink-0">
              <Download className="size-3.5" /> Export data
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-[#f4f6f9] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#172033]">Delete this workspace</p>
              <p className="mt-0.5 text-xs text-[#8b96a9]">
                Permanently removes every task, client, and file. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#ffd3d5] bg-white px-4 py-2.5 text-sm font-semibold text-[#ff646b] transition hover:bg-[#fff0f0]"
            >
              <Trash2 className="size-4" /> Delete workspace
            </button>
          </div>
        </section>
      </form>
    </TaskflowShell>
  );
}

export default SettingsPage;
