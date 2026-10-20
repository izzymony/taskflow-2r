'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'

import { Sidebar } from '@/components/ui/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { type Task } from '@/components/task-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed'

const tasks: (Task & { status: TaskStatus; dueIn: string; priority: string })[] = [
  {
    title: 'Change Top CTA button',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['Web', 'SaaS'],
    status: 'To Do',
    dueIn: '4d',
    priority: 'High',
    meta: '4 · 50% · 2',
  },
  {
    title: 'Redesign analytics dashboard',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['SaaS', 'Mobile'],
    status: 'To Do',
    dueIn: '4d',
    priority: 'High',
  },
  {
    title: 'Create landing page',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['Web', 'SaaS'],
    status: 'To Do',
    dueIn: '4d',
    priority: 'Medium',
  },
  {
    title: 'Redesign news page',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['Web'],
    status: 'In Progress',
    dueIn: '4d',
    priority: 'Medium',
    meta: '4 · 50%',
  },
  {
    title: 'Copywrite',
    client: 'Taskz',
    assignee: 'Shivam Chavan',
    tags: ['Web'],
    status: 'In Progress',
    dueIn: '4d',
    priority: 'Low',
  },
  {
    title: 'UI Animation for the onboarding...',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['Web', 'SaaS'],
    status: 'In Review',
    dueIn: '4d',
    priority: 'High',
    meta: '4 · 50%',
  },
  {
    title: 'UI Dark mode improvements',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['SaaS', 'Mobile'],
    status: 'In Review',
    dueIn: '4d',
    priority: 'Medium',
  },
  {
    title: 'Mobile Redesign',
    client: 'Stellar',
    assignee: 'Shivam Chavan',
    tags: ['Mobile'],
    status: 'In Review',
    dueIn: '4d',
    priority: 'Medium',
  },
  {
    title: 'Navigation improvement',
    client: 'Taskz',
    assignee: 'Shivam Chavan',
    tags: ['Web'],
    status: 'Completed',
    dueIn: '4d',
    priority: 'Medium',
  },
  {
    title: 'Text Animation',
    client: 'Taskz',
    assignee: 'Shivam Chavan',
    tags: ['Web'],
    status: 'Completed',
    dueIn: '4d',
    priority: 'Low',
  },
]

function getTagColor(tag: string): string {
  if (tag === 'Web') return 'bg-sky-50 text-sky-600'
  if (tag === 'SaaS') return 'bg-amber-50 text-amber-600'
  if (tag === 'Mobile') return 'bg-fuchsia-50 text-fuchsia-600'
  return 'bg-fuchsia-50 text-fuchsia-600'
}

const statusColor: Record<TaskStatus, string> = {
  'To Do': 'bg-sky-500',
  'In Progress': 'bg-amber-500',
  'In Review': 'bg-violet-500',
  Completed: 'bg-emerald-500',
}

export default function TasksPage() {
  const [view, setView] = useState<'List' | 'Board'>('List')
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <main className="flex min-h-screen bg-white text-slate-900">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <section className="min-w-0 flex-1 bg-white">
        <DashboardHeader
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenu={() => setIsMobileMenuOpen((open) => !open)}
        />
        <div className="px-5 py-6 sm:px-8">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>⌂</span>
            <span>/</span>
            <span>Tasks</span>
            <span>/</span>
            <span className="font-medium text-slate-700">All Tasks</span>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
              <div className="mt-4 flex items-center gap-1 border-b border-slate-100">
                <button
                  onClick={() => setView('List')}
                  className={cn(
                    'px-3 py-2 text-[10px] font-medium transition',
                    view === 'List'
                      ? 'border-b-2 border-violet-600 text-slate-900'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  List
                </button>
                <button
                  onClick={() => setView('Board')}
                  className={cn(
                    'px-3 py-2 text-[10px] font-medium transition',
                    view === 'Board'
                      ? 'border-b-2 border-violet-600 text-slate-900'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  Board
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="size-3" />
                Filters
              </Button>
              <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Trigger
                  render={
                    <Button size="sm">
                      <Plus className="size-3" />
                      New Task
                    </Button>
                  }
                />
                <Dialog.Portal>
                  <Dialog.Backdrop className="fixed inset-0 bg-black/20" />
                  <Dialog.Popup className="fixed left-1/2 top-1/2 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-sm font-semibold text-slate-900">
                        Create New Task
                      </Dialog.Title>
                      <Dialog.Close className="text-slate-400 hover:text-slate-700">
                        ×
                      </Dialog.Close>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      This is a mock dialog. No API calls are made.
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        Title
                        <input
                          placeholder="Enter task title"
                          className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none placeholder:text-slate-400 focus:border-violet-500"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                        Assignee
                        <input
                          placeholder="Select assignee"
                          className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none placeholder:text-slate-400 focus:border-violet-500"
                        />
                      </label>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="flex-1">
                          Create
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>

          {view === 'List' ? (
            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-[800px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-2 font-medium">Task</th>
                    <th className="px-4 py-2 font-medium">Client</th>
                    <th className="px-4 py-2 font-medium">Assignee</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Priority</th>
                    <th className="px-4 py-2 font-medium">Tags</th>
                    <th className="px-4 py-2 font-medium">Due</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.title} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2">
                        <p className="text-xs font-medium text-slate-800">
                          {task.title}
                        </p>
                        {task.meta && (
                          <p className="mt-0.5 text-[9px] text-slate-400">
                            {task.meta}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600">
                        {task.client}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="flex size-5 items-center justify-center rounded-full bg-violet-100 text-[8px] font-bold text-violet-700">
                            SC
                          </span>
                          <span className="text-xs text-slate-600">
                            {task.assignee}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span
                            className={cn('size-1.5 rounded-full', statusColor[task.status])}
                          />
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600">
                        {task.priority}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                'rounded px-1 py-0.5 text-[8px] font-medium',
                                getTagColor(tag)
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-400">
                        {task.dueIn}
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="grid min-w-[850px] grid-cols-4 gap-4">
                {['To Do', 'In Progress', 'In Review', 'Completed'].map((status) => {
                const items = tasks.filter((t) => t.status === status)
                return (
                  <section key={status} className="min-w-0">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-[10px] font-bold text-slate-800">
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            statusColor[status as TaskStatus]
                          )}
                        />
                        {status}
                        <span className="font-normal text-slate-400">
                          {items.length}
                        </span>
                      </h2>
                      <div className="flex gap-2 text-slate-400">
                        <Plus className="size-3" />
                        <MoreHorizontal className="size-3" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {items.map((task) => (
                        <article
                          key={task.title}
                          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <p className="text-[9px] text-slate-400">
                            Client: {task.client}
                          </p>
                          <h3 className="mt-1 text-[11px] font-semibold leading-4 text-slate-800">
                            {task.title}
                          </h3>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[7px] font-bold text-violet-700">
                                SC
                              </span>
                              <span className="truncate text-[9px] text-slate-500">
                                {task.assignee}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    'rounded px-1 py-0.5 text-[8px] font-medium',
                                    getTagColor(tag)
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400">
                            <span>◌ {task.meta}</span>
                            <span>◷ {task.dueIn}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
