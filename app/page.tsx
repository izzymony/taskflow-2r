'use client'

import { useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Grid2X2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Target,
  Users,
  X,
} from 'lucide-react'

const tasks = [
  { title: 'Prepare Q4 product roadmap', detail: 'Align priorities with the product and engineering teams.', status: 'In progress', priority: 'High', color: 'blue' },
  { title: 'Review campaign performance', detail: 'Check the latest acquisition report before standup.', status: 'To do', priority: 'Medium', color: 'coral' },
  { title: 'Send weekly team update', detail: 'Share wins, blockers, and focus areas with the team.', status: 'To do', priority: 'Low', color: 'purple' },
]

const completed = [
  { title: 'Update onboarding checklist', detail: 'Make the first-week experience easier for new teammates.', date: 'Yesterday' },
  { title: 'Plan design critique', detail: 'Review the new dashboard direction with the design team.', date: '2 days ago' },
]

const nav = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'My tasks', icon: ListChecks },
  { label: 'Team', icon: Users },
  { label: 'Goals', icon: Target },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const filteredTasks = useMemo(() => tasks.filter((task) => `${task.title} ${task.detail}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#172033]">
      <header className="sticky top-0 z-20 border-b border-[#e9edf5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-8 px-5 lg:px-10">
          <div className="flex min-w-[190px] items-center gap-2 text-[21px] font-bold tracking-tight"><span className="text-[#ff646b]">task</span><span>flow</span></div>
          <div className="relative hidden max-w-[610px] flex-1 md:block">
            <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#9aa4b5]" />
            <input aria-label="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your tasks..." className="h-11 w-full rounded-xl border border-[#edf0f5] bg-[#f8faff] pl-11 pr-4 text-sm outline-none transition focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Notifications" className="icon-button"><Bell className="size-[18px]" /></button>
            <button aria-label="Calendar" className="icon-button"><CalendarDays className="size-[18px]" /></button>
            <div className="hidden items-center gap-3 border-l border-[#edf0f5] pl-5 sm:flex"><div className="avatar bg-[#dbe8ff]">AM</div><div className="hidden text-left lg:block"><p className="text-sm font-semibold">Amanuel</p><p className="text-xs text-[#8b96a9]">Workspace admin</p></div><ChevronDown className="size-4 text-[#8b96a9]" /></div>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1500px] gap-8 px-5 py-7 lg:px-10">
        <aside className="hidden w-[220px] shrink-0 flex-col lg:flex">
          <div className="mb-9 rounded-2xl bg-[#172033] p-5 text-white shadow-xl shadow-[#172033]/10"><div className="mb-5 flex items-center justify-between"><div className="avatar bg-[#ff8b88] text-white">AM</div><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-[#bfc8d8]">PRO</span></div><p className="font-semibold">Good morning, Amanuel</p><p className="mt-1 text-xs text-[#aeb9cc]">Let&apos;s make today productive.</p></div>
          <nav className="space-y-1">{nav.map(({ label, icon: Icon, active }) => <button key={label} className={`side-link ${active ? 'side-link-active' : ''}`}><Icon className="size-[18px]" />{label}</button>)}</nav>
          <div className="mt-auto space-y-1 pt-20"><button className="side-link"><Settings className="size-[18px]" />Settings</button><button className="side-link"><CircleHelp className="size-[18px]" />Help center</button><button className="side-link text-[#ff646b]"><LogOut className="size-[18px]" />Log out</button></div>
        </aside>
        <section className="min-w-0 flex-1">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#ff646b]">Tuesday, June 20, 2023</p><h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-[38px]">Your work, simplified.</h1><p className="mt-2 text-sm text-[#7f8a9e]">Here&apos;s what&apos;s happening across your workspace today.</p></div><button onClick={() => setShowComposer(true)} className="primary-button"><Plus className="size-[18px]" />Add new task</button></div>
          <div className="mb-7 grid gap-4 sm:grid-cols-3"><StatCard label="Total tasks" value="24" note="4 added this week" tone="coral" icon={ClipboardCheck} /><StatCard label="In progress" value="08" note="2 due today" tone="blue" icon={SlidersHorizontal} /><StatCard label="Completed" value="16" note="67% completion rate" tone="green" icon={Check} /></div>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <section className="panel"><div className="panel-heading"><div><h2 className="section-title">My tasks</h2><p className="section-subtitle">Keep your momentum going</p></div><button className="soft-button"><SlidersHorizontal className="size-4" />Filter</button></div><div className="space-y-3">{filteredTasks.map((task) => <TaskCard key={task.title} {...task} />)}{filteredTasks.length === 0 && <p className="py-10 text-center text-sm text-[#8b96a9]">No tasks match your search.</p>}</div><button onClick={() => setShowComposer(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d8deea] py-3 text-sm font-medium text-[#7f8a9e] transition hover:border-[#ff646b] hover:text-[#ff646b]"><Plus className="size-4" />Add another task</button></section>
            <section className="panel"><div className="panel-heading"><div><h2 className="section-title">Progress</h2><p className="section-subtitle">Your productivity this week</p></div><button aria-label="More options" className="text-[#9aa4b5]">•••</button></div><div className="flex items-center justify-center py-4"><div className="progress-ring"><div><strong>67%</strong><span>completed</span></div></div></div><div className="mt-4 grid grid-cols-3 border-t border-[#edf0f5] pt-5 text-center"><div><p className="text-xl font-bold">16</p><p className="mt-1 text-xs text-[#8b96a9]">Completed</p></div><div><p className="text-xl font-bold">8</p><p className="mt-1 text-xs text-[#8b96a9]">In progress</p></div><div><p className="text-xl font-bold">24</p><p className="mt-1 text-xs text-[#8b96a9]">Total</p></div></div></section>
            <section className="panel xl:col-span-2"><div className="panel-heading"><div><h2 className="section-title">Recently completed</h2><p className="section-subtitle">A little progress every day adds up.</p></div><button className="text-sm font-semibold text-[#ff646b]">View all</button></div><div className="grid gap-3 md:grid-cols-2">{completed.map((task) => <div key={task.title} className="completed-card"><div className="check-circle"><Check className="size-3" /></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{task.title}</h3><p className="mt-1 truncate text-sm text-[#8b96a9]">{task.detail}</p></div><span className="shrink-0 text-xs text-[#a3adbc]">{task.date}</span></div>)}</div></section>
          </div>
        </section>
      </div>
      {showComposer && <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#172033]/30 p-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Create a task</h2><button onClick={() => setShowComposer(false)} aria-label="Close"><X className="size-5 text-[#8b96a9]" /></button></div><input autoFocus placeholder="What needs to be done?" className="mb-4 h-12 w-full rounded-xl border border-[#e5e9f1] px-4 text-sm outline-none focus:border-[#ff646b]" /><button onClick={() => setShowComposer(false)} className="primary-button w-full justify-center">Create task</button></div></div>}
    </main>
  )
}

function StatCard({ label, value, note, tone, icon: Icon }: { label: string; value: string; note: string; tone: string; icon: typeof ClipboardCheck }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon className="size-[18px]" /></div><div><p className="text-sm text-[#7f8a9e]">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-[#8b96a9]">{note}</p></div></div> }
function TaskCard({ title, detail, status, priority, color }: { title: string; detail: string; status: string; priority: string; color: string }) { return <article className="task-card"><div className={`task-dot ${color}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{title}</h3><span className={`status-pill ${status === 'In progress' ? 'status-blue' : 'status-muted'}`}>{status}</span></div><p className="mt-2 text-sm leading-6 text-[#7f8a9e]">{detail}</p><div className="mt-4 flex items-center gap-3 text-xs text-[#8b96a9]"><span>Priority: <b className="font-medium text-[#172033]">{priority}</b></span><span className="text-[#d5dbe5]">|</span><span>Due today</span></div></div></article> }
