'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Ban,
  CheckCircle2,
  MailPlus,
  ShieldCheck,
  Trash2,
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
import type {
  ICreateUserInput,
  IUser,
  PagePreviewState,
  UserAccess,
  UserRole,
} from '@/lib/types';

const roleTone: Record<UserRole, string> = {
  Admin: 'status-purple',
  Editor: 'status-blue',
  Viewer: 'status-muted',
};

const statusTone: Record<IUser['status'], string> = {
  Active: 'status-green',
  Invited: 'status-amber',
  Suspended: 'status-red',
};

const INITIAL_MEMBERS: IUser[] = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@taskflow.app',
    role: 'Admin',
    access: 'Full',
    status: 'Active',
    joinedAt: 'Jan 12, 2026',
    lastActive: '2 minutes ago',
    department: 'Product',
    tasks: 24,
    avatar: 'SC',
  },
  {
    id: 'user-2',
    name: 'Marcus Reed',
    email: 'marcus.reed@taskflow.app',
    role: 'Editor',
    access: 'Full',
    status: 'Active',
    joinedAt: 'Jan 20, 2026',
    lastActive: '18 minutes ago',
    department: 'Marketing',
    tasks: 17,
    avatar: 'MR',
  },
  {
    id: 'user-3',
    name: 'Aisha Patel',
    email: 'aisha.patel@taskflow.app',
    role: 'Editor',
    access: 'Limited',
    status: 'Active',
    joinedAt: 'Feb 03, 2026',
    lastActive: '1 hour ago',
    department: 'Finance',
    tasks: 11,
    avatar: 'AP',
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david.kim@taskflow.app',
    role: 'Viewer',
    access: 'Read-only',
    status: 'Active',
    joinedAt: 'Feb 11, 2026',
    lastActive: 'Yesterday',
    department: 'Engineering',
    tasks: 4,
    avatar: 'DK',
  },
  {
    id: 'user-5',
    name: 'Maya Chen',
    email: 'maya.chen@taskflow.app',
    role: 'Editor',
    access: 'Full',
    status: 'Active',
    joinedAt: 'Feb 19, 2026',
    lastActive: '3 hours ago',
    department: 'Design',
    tasks: 19,
    avatar: 'MC',
  },
  {
    id: 'user-6',
    name: 'Jon Bell',
    email: 'jon.bell@taskflow.app',
    role: 'Viewer',
    access: 'Read-only',
    status: 'Invited',
    joinedAt: 'Pending',
    lastActive: 'Never',
    department: 'Legal',
    tasks: 0,
    avatar: 'JB',
  },
  {
    id: 'user-7',
    name: 'Priya Sharma',
    email: 'priya.sharma@taskflow.app',
    role: 'Viewer',
    access: 'Limited',
    status: 'Suspended',
    joinedAt: 'Mar 02, 2026',
    lastActive: '2 weeks ago',
    department: 'Sales',
    tasks: 6,
    avatar: 'PS',
  },
];

type RoleFilter = 'All' | UserRole;

interface UsersManagementPageProps {
  preview?: PagePreviewState;
}

export function UsersManagementPage({ preview }: UsersManagementPageProps) {
  const { status, error, retry } = useResource({ preview });
  const [members, setMembers] = useState<IUser[]>(INITIAL_MEMBERS);
  const [filter, setFilter] = useState<RoleFilter>('All');
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ICreateUserInput>({
    name: '',
    email: '',
    role: 'Viewer',
    access: 'Read-only',
  });

  const counts = useMemo(
    () => ({
      All: members.length,
      Admin: members.filter((member) => member.role === 'Admin').length,
      Editor: members.filter((member) => member.role === 'Editor').length,
      Viewer: members.filter((member) => member.role === 'Viewer').length,
      invited: members.filter((member) => member.status === 'Invited').length,
    }),
    [members],
  );

  const visibleMembers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesFilter = filter === 'All' || member.role === filter;
      const matchesQuery =
        !term ||
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.department.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [members, filter, query]);

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    const newMember: IUser = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      access: form.access,
      status: 'Invited',
      joinedAt: 'Pending',
      lastActive: 'Never',
      department: 'Unassigned',
      tasks: 0,
      avatar: form.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join(''),
    };

    setMembers((current) => [newMember, ...current]);
    setForm({ name: '', email: '', role: 'Viewer', access: 'Read-only' });
    setIsAdding(false);
    setFilter('All');
    setQuery('');
    setNotice(`Invitation sent to ${newMember.email}.`);
  }

  function changeRole(id: string, role: UserRole) {
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, role } : member)),
    );
  }

  function changeAccess(id: string, access: UserAccess) {
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, access } : member)),
    );
  }

  function toggleSuspension(id: string) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id
          ? {
              ...member,
              status: member.status === 'Suspended' ? ('Active' as const) : ('Suspended' as const),
            }
          : member,
      ),
    );
  }

  function removeMember(id: string) {
    const member = members.find((item) => item.id === id);
    setMembers((current) => current.filter((item) => item.id !== id));
    if (member) setNotice(`${member.name} was removed from the workspace.`);
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow="WORKSPACE"
        title="Users management"
        description="Manage members, roles, and access to your workspace."
        action={
          <button
            type="button"
            onClick={() => setIsAdding((open) => !open)}
            className="primary-button"
          >
            <UserPlus className="size-[18px]" />
            Invite member
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
            title="Invite a new member"
            description="They receive an email invitation and join with the access level you pick."
            onCancel={() => setIsAdding(false)}
            onSubmit={handleInvite}
            submitLabel="Send invitation"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="member-name">
                <input
                  id="member-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Rosa Alvarez"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="member-email">
                <input
                  id="member-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="rosa@taskflow.app"
                  className={inputClass}
                />
              </Field>
              <Field label="Role" htmlFor="member-role">
                <select
                  id="member-role"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value as UserRole,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Admin', 'Editor', 'Viewer'] as UserRole[]).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Access level" htmlFor="member-access">
                <select
                  id="member-access"
                  value={form.access}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      access: event.target.value as UserAccess,
                    }))
                  }
                  className={selectClass}
                >
                  {(['Full', 'Limited', 'Read-only'] as UserAccess[]).map((access) => (
                    <option key={access} value={access}>
                      {access}
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
          label="Total members"
          value={counts.All}
          hint="Across 6 departments"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Admins"
          value={counts.Admin}
          hint="Full workspace control"
          icon={ShieldCheck}
          tone="purple"
        />
        <StatCard
          label="Pending invites"
          value={counts.invited}
          hint="Waiting to accept"
          icon={MailPlus}
          tone="amber"
        />
        <StatCard
          label="Seats used"
          value={`${counts.All} / 25`}
          hint="18 seats still available"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <section className="panel mt-6">
        <div className="panel-heading flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title">Members</h2>
            <p className="section-subtitle">
              {visibleMembers.length} of {members.length} members shown
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <FilterTabs<RoleFilter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'All', label: 'All', count: counts.All },
                { value: 'Admin', label: 'Admins', count: counts.Admin },
                { value: 'Editor', label: 'Editors', count: counts.Editor },
                { value: 'Viewer', label: 'Viewers', count: counts.Viewer },
              ]}
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search members…"
              className="sm:w-52"
            />
          </div>
        </div>

        {status === 'loading' ? (
          <PageLoading label="Loading members…" rows={4} />
        ) : status === 'error' ? (
          <PageError message={error ?? 'We could not load the member list.'} onRetry={retry} />
        ) : visibleMembers.length === 0 || preview === 'empty' ? (
          <EmptyState
            icon={Users}
            title={
              members.length && preview !== 'empty'
                ? 'No members match your filters'
                : 'No members yet'
            }
            description={
              members.length && preview !== 'empty'
                ? 'Try another search term or switch the role filter.'
                : 'Invite the first teammate to start collaborating in this workspace.'
            }
            action={
              <button type="button" onClick={() => setIsAdding(true)} className="soft-button">
                <UserPlus className="size-3.5" /> Invite member
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#edf0f5]">
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Member</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Department</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Role</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Access</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Status</th>
                  <th className="pb-3 text-xs font-semibold text-[#566176]">Last active</th>
                  <th className="pb-3 text-right text-xs font-semibold text-[#566176]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[#f4f6f9] transition hover:bg-[#f8faff]"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] text-xs font-bold text-[#4e7cff]">
                          {member.avatar || member.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {member.name}
                          </p>
                          <p className="truncate text-xs text-[#8b96a9]">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-[#566176]">{member.department}</td>
                    <td className="py-4">
                      <select
                        value={member.role}
                        onChange={(event) =>
                          changeRole(String(member.id), event.target.value as UserRole)
                        }
                        aria-label={`Role for ${member.name}`}
                        className="rounded-lg border border-[#e7ebf2] bg-white px-2 py-1 text-xs font-semibold text-[#566176] outline-none transition focus:border-[#ff646b]"
                      >
                        {(['Admin', 'Editor', 'Viewer'] as UserRole[]).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4">
                      <select
                        value={member.access}
                        onChange={(event) =>
                          changeAccess(String(member.id), event.target.value as UserAccess)
                        }
                        aria-label={`Access level for ${member.name}`}
                        className="rounded-lg border border-[#e7ebf2] bg-white px-2 py-1 text-xs font-semibold text-[#566176] outline-none transition focus:border-[#ff646b]"
                      >
                        {(['Full', 'Limited', 'Read-only'] as UserAccess[]).map((access) => (
                          <option key={access} value={access}>
                            {access}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4">
                      <span className={cn('status-pill', statusTone[member.status])}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-[#8b96a9]">{member.lastActive}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSuspension(String(member.id))}
                          aria-label={`${member.status === 'Suspended' ? 'Activate' : 'Suspend'} ${member.name}`}
                          className="soft-button px-2"
                        >
                          {member.status === 'Suspended' ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <Ban className="size-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(String(member.id))}
                          aria-label={`Remove ${member.name}`}
                          className="soft-button px-2 hover:border-[#ff646b] hover:text-[#ff646b]"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
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

export default UsersManagementPage;
