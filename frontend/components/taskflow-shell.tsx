'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import {
  Bell,
  CalendarDays,
  CreditCard,
  FileText,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { logout } from '@/lib/api/auth'

const navigation = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Automations', href: '/automations', icon: Sparkles },
  { label: 'Audience', href: '/clients', icon: Users },
  { label: 'Client Tasks', href: '/client-tasks', icon: FolderKanban },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays },
  { label: 'Templates', href: '/docs', icon: FileText },
  { label: 'Integrations', href: '/files', icon: FolderOpen },
  { label: 'Analytics', href: '/payments', icon: CreditCard },
  { label: 'Users', href: '/users-management', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function TaskflowShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { fullname, firstName, initials } = useProfile()

  // Determine current section name for top breadcrumb
  const currentNav = navigation.find((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  )
  const currentPageTitle = currentNav?.label || 'Audience'

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between px-2 pt-1">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#6355ff] text-white shadow-sm shadow-[#6355ff]/25">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
          </Link>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Toggle sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`side-link ${isActive ? 'side-link-active' : ''}`}
              >
                <Icon className="size-[18px] shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Profile */}
      <div className="border-t border-slate-100 pt-4 space-y-1">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="size-9 rounded-full bg-gradient-to-br from-[#6355ff] to-[#9061f9] text-white font-semibold flex items-center justify-center text-xs shrink-0 ring-2 ring-white shadow-sm">
            {initials || 'TF'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
              {fullname || 'Taskflow User'}
            </p>
            <p className="text-[11px] text-slate-400">Pro Plan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-[15px] shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900 flex">
      {/* Desktop Fixed/Sticky Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white sticky top-0 h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur">
          {/* Left: Mobile Toggle + Page Title Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
              {currentPageTitle}
            </span>
          </div>

          {/* Right: Search, Notifications, AI Insight */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="relative hidden md:block w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search here..."
                className="h-10 w-full rounded-full border border-slate-200 bg-[#f8fafc] pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#6355ff] focus:bg-white focus:ring-4 focus:ring-[#6355ff]/10 transition"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-[#6355ff] transition"
            >
              <Bell className="size-4" />
              <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#ff4d4f] ring-2 ring-white" />
            </button>

            {/* Gradient Get AI Insight Button */}
            <button
              type="button"
              className="ai-insight-button"
            >
              <Sparkles className="size-3.5" />
              <span>Get Ai Insight</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 size-full bg-slate-900/40 backdrop-blur-xs"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col">
            <div className="flex justify-end p-3">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#6355ff]">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  )
}
