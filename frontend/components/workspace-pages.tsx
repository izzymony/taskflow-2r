'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PageHeader, TaskflowShell } from './taskflow-shell'

type PageConfig = {
  eyebrow: string
  title: string
  description: string
  panelTitle: string
  panelDescription: string
  useCase: string
  itemDescription: string
  addLabel: string
  metric: string
  metricLabel: string
  items: string[]
}

const pageData: Record<string, PageConfig> = {
  '/': {
    eyebrow: 'OVERVIEW',
    title: 'Your work, simplified.',
    description: 'See priorities, blockers, and progress before your next standup.',
    panelTitle: 'Today’s focus',
    panelDescription: 'The work that needs attention next.',
    useCase: 'Plan the day',
    itemDescription: 'Assign an owner, due date, and status so this work does not get lost.',
    addLabel: 'Add task',
    metric: '8',
    metricLabel: 'tasks in progress',
    items: ['Prepare Q4 product roadmap', 'Review campaign performance', 'Send weekly team update'],
  },
  '/workflows': {
    eyebrow: 'OPERATIONS',
    title: 'Workflows',
    description: 'Turn the way your team works into repeatable, visible processes.',
    panelTitle: 'Active processes',
    panelDescription: 'Track handoffs from trigger to completion.',
    useCase: 'Standardize delivery',
    itemDescription: 'Define each step, owner, and approval point for this process.',
    addLabel: 'Create workflow',
    metric: '6',
    metricLabel: 'active workflows',
    items: ['Client onboarding', 'Weekly content review', 'Invoice approval'],
  },
  '/automations': {
    eyebrow: 'AUTOMATE',
    title: 'Automations',
    description: 'Remove repetitive follow-up from your team’s workload.',
    panelTitle: 'Rules running for you',
    panelDescription: 'Events that trigger useful actions automatically.',
    useCase: 'Reduce manual work',
    itemDescription: 'Connect a trigger to an action and see when it last ran.',
    addLabel: 'New automation',
    metric: '42',
    metricLabel: 'runs this week',
    items: [
      'Remind assignee when a task is overdue',
      'Create follow-up after a client call',
      'Notify finance when a payment lands',
    ],
  },
  '/schedule': {
    eyebrow: 'PLANNING',
    title: 'Schedule',
    description: 'Coordinate meetings, deadlines, and focused work without context switching.',
    panelTitle: 'Your next commitments',
    panelDescription: 'A practical view of what is coming up.',
    useCase: 'Protect team time',
    itemDescription: 'Link this event to a client, project, owner, and follow-up task.',
    addLabel: 'Add event',
    metric: '3',
    metricLabel: 'events today',
    items: ['Design critique · 10:00 AM', 'Client check-in · 1:30 PM', 'Focus time · 3:00 PM'],
  },
  '/clients': {
    eyebrow: 'RELATIONSHIPS',
    title: 'Clients',
    description: 'Keep people, conversations, deliverables, and next steps together.',
    panelTitle: 'Client health',
    panelDescription: 'Relationships that need context or action.',
    useCase: 'Keep clients moving',
    itemDescription: 'Store contacts, open work, notes, and next actions in one client record.',
    addLabel: 'Add client',
    metric: '12',
    metricLabel: 'active clients',
    items: [
      'Northstar Studio · Proposal review due Friday',
      'Brightline Labs · Renewal conversation',
      'Cedar & Co. · Waiting on assets',
    ],
  },
  '/users-management': {
    eyebrow: 'WORKSPACE',
    title: 'Users management',
    description: 'Give every teammate the access and ownership they need.',
    panelTitle: 'Workspace access',
    panelDescription: 'Members, roles, and recent activity.',
    useCase: 'Manage accountability',
    itemDescription: 'Set a role, permission level, and team assignment for this member.',
    addLabel: 'Invite user',
    metric: '18',
    metricLabel: 'workspace members',
    items: ['Amanuel · Admin · Active now', 'Maya Chen · Editor · Active 12m ago', 'Jon Bell · Viewer · Invited yesterday'],
  },
  '/payments': {
    eyebrow: 'FINANCE',
    title: 'Payments',
    description: 'Know what has been collected, what is due, and what needs follow-up.',
    panelTitle: 'Cash flow actions',
    panelDescription: 'Payment records that need a decision.',
    useCase: 'Keep revenue predictable',
    itemDescription: 'Connect this record to an invoice, client, amount, and payment provider.',
    addLabel: 'Record payment',
    metric: '$12.4k',
    metricLabel: 'collected this month',
    items: ['$12,480 collected this month', '3 invoices awaiting payment', 'Last payout · Jun 18, 2023'],
  },
  '/files': {
    eyebrow: 'KNOWLEDGE',
    title: 'Company files',
    description: 'Give your team one trusted place for shared files and company documents.',
    panelTitle: 'Recently used files',
    panelDescription: 'Files people are opening and sharing now.',
    useCase: 'Find the source of truth',
    itemDescription: 'Add an owner, folder, permissions, and version history when storage is connected.',
    addLabel: 'Upload file',
    metric: '248',
    metricLabel: 'shared files',
    items: ['Brand guidelines.pdf · Updated today', 'Q4 planning deck.pptx · Shared with team', 'Client proposal template.docx · 4 versions'],
  },
  '/docs': {
    eyebrow: 'KNOWLEDGE',
    title: 'Docs',
    description: 'Capture decisions and make important knowledge easy to find.',
    panelTitle: 'Team documentation',
    panelDescription: 'Documents that help people move without asking twice.',
    useCase: 'Make knowledge reusable',
    itemDescription: 'Add collaborators, status, and last-reviewed date to keep this document trustworthy.',
    addLabel: 'Create doc',
    metric: '24',
    metricLabel: 'team documents',
    items: ['Getting started · New hire guide', 'Team handbook · Reviewed this month', 'Product requirements · In progress'],
  },
}

export function WorkspacePage({ type }: { type: string }) {
  const data = pageData[type] ?? pageData['/']
  const [items, setItems] = useState(data.items)
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const addItem = () => {
    setItems((current) => [
      ...current,
      `New ${data.title.toLowerCase().replace('users management', 'workspace member')}`,
    ])
  }

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setOpenMenu(null)
  }

  const duplicateItem = (index: number) => {
    setItems((current) => [
      ...current.slice(0, index + 1),
      `${current[index]} copy`,
      ...current.slice(index + 1),
    ])
    setOpenMenu(null)
  }

  return (
    <TaskflowShell>
      <PageHeader
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        action={
          <button onClick={addItem} className="primary-button">
            <Plus className="size-[18px]" />
            {data.addLabel}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="section-title">{data.panelTitle}</h2>
              <p className="section-subtitle">{data.panelDescription}</p>
            </div>
            <button className="soft-button">Filter</button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <article key={`${item}-${index}`} className="task-card task-card-menu">
                <div className="task-dot blue" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{item}</h3>
                    <span className="status-pill status-blue">Active</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#7f8a9e]">{data.itemDescription}</p>
                </div>

                <div
                  className="task-actions"
                  onMouseEnter={() => setOpenMenu(index)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    aria-label={`Actions for ${item}`}
                    aria-expanded={openMenu === index}
                    onClick={() => setOpenMenu(openMenu === index ? null : index)}
                    className="task-menu-trigger"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                  {openMenu === index && (
                    <div role="menu" className="task-menu">
                      <button type="button" role="menuitem" className="task-menu-item">
                        <Pencil className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => duplicateItem(index)}
                        className="task-menu-item"
                      >
                        <Copy className="size-4" />
                        Duplicate
                      </button>
                      <button type="button" role="menuitem" className="task-menu-item">
                        <Check className="size-4" />
                        Mark done
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => removeItem(index)}
                        className="task-menu-item task-menu-danger"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel">
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
            <Sparkles className="size-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ff646b]">{data.useCase}</p>
          <h2 className="mt-2 text-xl font-bold">Built for the next decision.</h2>
          <p className="mt-2 text-sm leading-6 text-[#7f8a9e]">
            {data.description} Use this space to connect the page to your backend, then turn each item into a real record.
          </p>
          <div className="mt-6 rounded-xl bg-[#f6f8fc] p-4">
            <p className="text-2xl font-bold">{data.metric}</p>
            <p className="mt-1 text-xs text-[#8b96a9]">{data.metricLabel}</p>
          </div>
          <button onClick={addItem} className="soft-button mt-5 w-full justify-center">
            <Plus className="size-4" />
            {data.addLabel}
          </button>
        </aside>
      </div>
    </TaskflowShell>
  )
}

export function ChatPage() {
  const [messages, setMessages] = useState([
    'Welcome to taskflow chat. Ask about your projects, clients, or next steps.',
  ])
  const [draft, setDraft] = useState('')

  const send = () => {
    if (!draft.trim()) return
    setMessages((all) => [
      ...all,
      draft.trim(),
      'Thanks — this response area is ready to connect to your AI or chat backend.',
    ])
    setDraft('')
  }

  return (
    <TaskflowShell>
      <PageHeader eyebrow="COLLABORATE" title="Chat" description="Talk through work with your team or an assistant." />
      <section className="panel mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3 border-b border-[#edf0f5] pb-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff646b]">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h2 className="font-bold">Workspace assistant</h2>
            <p className="text-xs text-[#8b96a9]">Online · Ready to help</p>
          </div>
        </div>
        <div className="min-h-[330px] space-y-3">
          {messages.map((message, index) => (
            <div
              key={`${message}-${index}`}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${index % 2 === 0 ? 'bg-[#f3f6fb] text-[#566176]' : 'ml-auto bg-[#172033] text-white'}`}
            >
              {message}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                send()
              }
            }}
            placeholder="Ask anything about your workspace..."
            className="h-12 flex-1 rounded-xl border border-[#e5e9f1] px-4 text-sm outline-none focus:border-[#ff646b]"
          />
          <button onClick={send} aria-label="Send message" className="primary-button">
            <Send className="size-4" />
          </button>
        </div>
      </section>
    </TaskflowShell>
  )
}
