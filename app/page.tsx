'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Circle,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Home,
  LayoutGrid,
  List,
  LockKeyhole,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from 'lucide-react'

type AuthMode = 'login' | 'signup'
type DashboardView = 'Board' | 'List' | 'Timeline' | 'Due Tasks'

type Task = {
  title: string
  client: string
  assignee: string
  tags: string[]
  meta?: string
}

const benefits = ['Unlimited projects and tasks', 'Shared views for every team', 'Insights that keep work moving']

const columns: { title: string; color: string; tasks: Task[] }[] = [
  {
    title: 'To Do',
    color: 'bg-sky-500',
    tasks: [
      { title: 'Change Top CTA button', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['Web', 'SaaS'], meta: '4 · 50% · 2' },
      { title: 'Redesign analytics dashboard', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['SaaS', 'Mobile'], meta: '4' },
      { title: 'Create landing page', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['Web', 'SaaS'], meta: '4' },
    ],
  },
  {
    title: 'In Progress',
    color: 'bg-amber-500',
    tasks: [
      { title: 'Redesign news page', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['Web'], meta: '4 · 50%' },
      { title: 'Copywrite', client: 'Taskz', assignee: 'Shivam Chavan', tags: ['Web'], meta: '4' },
    ],
  },
  {
    title: 'In Review',
    color: 'bg-violet-500',
    tasks: [
      { title: 'UI Animation for the onboarding...', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['Web', 'SaaS'], meta: '4 · 50%' },
      { title: 'UI Dark mode improvements', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['SaaS', 'Mobile'], meta: '4' },
      { title: 'Mobile Redesign', client: 'Stellar', assignee: 'Shivam Chavan', tags: ['Mobile'], meta: '4' },
    ],
  },
  {
    title: 'Completed',
    color: 'bg-emerald-500',
    tasks: [
      { title: 'Navigation improvement', client: 'Taskz', assignee: 'Shivam Chavan', tags: ['Web'], meta: '4' },
      { title: 'Text Animation', client: 'Taskz', assignee: 'Shivam Chavan', tags: ['Web'], meta: '4' },
    ],
  },
]

function Brand() {
  return <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white"><Zap className="size-4" fill="currentColor" /></span><span className="font-bold tracking-tight">TaskFlow</span></div>
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  const nav = [
    [Home, 'Home'], [LayoutGrid, 'Tasks'], [FileText, 'Docs'], [Circle, 'Schedule'], [Users, 'Chat'], [Folder, 'Payments'], [Users, 'Customers'], [Settings, 'Automations'], [UserRound, 'User Management'], [List, 'Workflows'],
  ] as const
  return <aside className="hidden w-[224px] shrink-0 border-r border-slate-200 bg-slate-50/80 px-3 py-5 lg:flex lg:flex-col">
    <div className="px-3"><Brand /></div>
    <div className="relative mt-7"><Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" /><input aria-label="Search" placeholder="Search" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-violet-400" /></div>
    <nav className="mt-5 flex flex-col gap-1" aria-label="Main navigation">{nav.map(([Icon, label]) => <button key={label} className={`flex h-8 items-center gap-3 rounded-md px-3 text-left text-xs font-medium transition ${label === 'Tasks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}><Icon className="size-3.5" />{label}</button>)}</nav>
    <div className="mt-5 flex items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span>File</span><span className="flex gap-2 text-slate-500"><Plus className="size-3" /><MoreHorizontal className="size-3" /></span></div>
    <div className="mt-2 flex flex-col gap-1">{['Store', 'Company', 'Employee'].map((item) => <button key={item} className="flex h-8 items-center gap-3 rounded-md px-3 text-xs text-slate-600 hover:bg-white"><Folder className="size-3.5" />{item}</button>)}</div>
    <div className="mt-auto border-t border-slate-200 px-3 pt-4"><button onClick={onLogout} className="text-xs font-medium text-slate-500 hover:text-violet-700">Sign out</button></div>
  </aside>
}

function TaskCard({ task }: { task: Task }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <p className="text-[9px] text-slate-400">Client: {task.client}</p><h3 className="mt-1 text-[11px] font-semibold leading-4 text-slate-800">{task.title}</h3>
    <div className="mt-3 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-1.5"><span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[7px] font-bold text-violet-700">SC</span><span className="truncate text-[9px] text-slate-500">{task.assignee}</span></div><div className="flex gap-1">{task.tags.map((tag) => <span key={tag} className={`rounded px-1 py-0.5 text-[8px] font-medium ${tag === 'Web' ? 'bg-sky-50 text-sky-600' : tag === 'SaaS' ? 'bg-amber-50 text-amber-600' : 'bg-fuchsia-50 text-fuchsia-600'}`}>{tag}</span>)}</div></div>
    <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400"><span>◌ {task.meta}</span><span>◷ 4d</span></div>
  </article>
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<DashboardView>('Board')
  return <main className="flex min-h-screen bg-white text-slate-900"><Sidebar onLogout={onLogout} /><section className="min-w-0 flex-1 bg-white"><header className="flex h-16 items-center justify-between border-b border-slate-100 px-5 sm:px-8"><button className="lg:hidden"><Menu className="size-5 text-slate-600" /></button><div className="flex items-center gap-3 lg:hidden"><Brand /></div><div className="ml-auto flex items-center gap-4"><Bell className="size-4 text-slate-400" /><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">AM</span><span className="hidden text-xs font-medium text-slate-700 sm:block">Alex Morgan</span><ChevronDown className="size-3 text-slate-400" /></div></div></header>
    <div className="px-5 py-6 sm:px-8"><div className="flex items-center gap-2 text-[10px] text-slate-400"><span>⌂</span><span>/</span><span>Board</span><span>/</span><span className="font-medium text-slate-700">Overview</span></div><div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Project</h1><div className="mt-4 flex items-center gap-1 border-b border-slate-100">{(['Board', 'List', 'Timeline', 'Due Tasks'] as DashboardView[]).map((item) => <button key={item} onClick={() => setView(item)} className={`px-3 py-2 text-[10px] font-medium transition ${view === item ? 'border-b-2 border-violet-600 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}>{item}</button>)}</div></div><div className="flex gap-2"><button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"><ArrowRight className="size-3 rotate-90" />Import</button><button className="flex h-8 items-center gap-2 rounded-md bg-slate-900 px-3 text-[10px] font-semibold text-white hover:bg-slate-700"><Plus className="size-3" />New Board</button></div></div>
      {view === 'Board' ? <div className="mt-7 grid min-w-[850px] grid-cols-4 gap-4 overflow-x-auto">{columns.map((column) => <section key={column.title} className="min-w-0"><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-[10px] font-bold text-slate-800"><span className={`size-1.5 rounded-full ${column.color}`} />{column.title}<span className="font-normal text-slate-400">{column.tasks.length}</span></h2><div className="flex gap-2 text-slate-400"><Plus className="size-3" /><MoreHorizontal className="size-3" /></div></div><div className="flex flex-col gap-3">{column.tasks.map((task) => <TaskCard key={task.title} task={task} />)}</div><button className="mt-3 flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-violet-700"><Plus className="size-3" />Add new</button></section>)}</div> : <div className="mt-10 rounded-xl border border-dashed border-slate-200 p-12 text-center"><Sparkles className="mx-auto size-5 text-violet-500" /><p className="mt-3 text-sm font-semibold text-slate-800">{view} view is ready for your workflow</p><p className="mt-1 text-xs text-slate-400">Switch back to Board to see your tasks.</p></div>}
    </div></section></main>
}

export default function Page() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isSignup = mode === 'signup'

  if (isAuthenticated) return <Dashboard onLogout={() => setIsAuthenticated(false)} />

  return <main className="min-h-screen bg-[#f7f7fb] text-slate-950 lg:grid lg:grid-cols-[minmax(380px,0.86fr)_minmax(520px,1.14fr)]"><section className="relative hidden overflow-hidden bg-[#17132f] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16"><div className="absolute -left-32 top-[-10%] size-[520px] rounded-full bg-violet-500/25 blur-[100px]" /><div className="absolute bottom-[-15%] right-[-12%] size-[500px] rounded-full bg-indigo-400/20 blur-[110px]" /><div className="relative"><Brand /></div><div className="relative mt-auto max-w-lg pb-12"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Work, in rhythm</p><h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-6xl">Bring clarity to the work that matters.</h1><p className="mt-6 max-w-md text-base leading-7 text-violet-100/70">TaskFlow gives your team one calm, focused place to plan, collaborate, and finish strong.</p><div className="mt-10 flex flex-col gap-4">{benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 text-sm text-violet-50/90"><span className="flex size-5 items-center justify-center rounded-full bg-violet-400/20 text-violet-200"><Check className="size-3" /></span>{benefit}</div>)}</div></div></section><section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24"><header className="flex items-center justify-between lg:justify-end"><div className="lg:hidden"><Brand /></div><p className="text-sm text-slate-500">{isSignup ? 'Already have an account?' : 'New to TaskFlow?'} <button onClick={() => setMode(isSignup ? 'login' : 'signup')} className="font-semibold text-violet-700 hover:text-violet-900">{isSignup ? 'Sign in' : 'Create account'}</button></p></header><div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12"><div className="mb-8"><div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Sparkles className="size-5" /></div><h2 className="text-3xl font-bold tracking-[-0.04em]">{isSignup ? 'Create your account' : 'Welcome back'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{isSignup ? 'Start organizing your team’s best work today.' : 'Sign in to pick up where you left off.'}</p></div><div className="grid grid-cols-2 gap-3"><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm"><span className="font-bold">G</span> Google</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm"><span className="text-base font-bold"></span> Apple</button></div><div className="my-7 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div><form onSubmit={(event) => { event.preventDefault(); setIsAuthenticated(true) }} className="flex flex-col gap-4">{isSignup && <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Full name<input required placeholder="Alex Morgan" className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></label>}<label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Work email<div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" /><input required type="email" placeholder="you@company.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /></div></label><label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Password<div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" /><input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm font-normal outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 rounded-md p-1 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>{isSignup && <label className="flex items-start gap-2 text-xs leading-5 text-slate-500"><input required type="checkbox" className="mt-1 accent-violet-600" />I agree to the Terms of Service and Privacy Policy.</label>}<button type="submit" className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#6753d6] text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-[#5744c2]">{isSignup ? 'Create account' : 'Sign in'}<ArrowRight className="size-4" /></button></form><p className="mt-10 text-center text-xs leading-5 text-slate-400">By continuing, you agree to TaskFlow&apos;s Terms and acknowledge the Privacy Policy.</p></div><footer className="flex justify-between text-xs text-slate-400"><span>© 2026 TaskFlow</span><span>Support · Privacy</span></footer></section></main>
}
