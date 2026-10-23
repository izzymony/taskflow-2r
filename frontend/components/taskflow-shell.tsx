'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bell, CalendarDays, CircleHelp, CreditCard, FileText, FolderKanban, FolderOpen, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Sparkles, Users, Workflow, X } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Automations', href: '/automations', icon: Sparkles },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Client Tasks', href: '/client-tasks', icon: FolderKanban },
  { label: 'Files', href: '/files', icon: FolderOpen },
  { label: 'Docs', href: '/docs', icon: FileText },
  { label: 'Users management', href: '/users-management', icon: Users },
  { label: 'Payments', href: '/payments', icon: CreditCard },
]

export function TaskflowShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { fullname, firstName, initials } = useProfile()

  const sidebar = (
    <>
      <div className="mb-7 rounded-2xl bg-[#172033] p-5 text-white shadow-xl shadow-[#172033]/10">
        <div className="mb-5 flex items-center justify-between">
          <div className="avatar bg-[#ff8b88] text-white">{initials || 'AM'}</div>
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-[#bfc8d8]">PRO</span>
        </div>
        <p className="font-semibold">Good morning, {firstName || 'there'}</p>
        <p className="mt-1 text-xs text-[#aeb9cc]">Let&apos;s make today productive.</p>
      </div>
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileMenuOpen(false)}
            aria-current={pathname === href ? 'page' : undefined}
            className={`side-link ${pathname === href ? 'side-link-active' : ''}`}
          >
            <Icon className="size-[17px]" />{label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 pt-8">
        <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="side-link"><Settings className="size-[18px]" />Settings</Link>
        <button className="side-link"><CircleHelp className="size-[18px]" />Help center</button>
        <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="side-link text-[#ff646b]"><LogOut className="size-[18px]" />Log out</Link>
      </div>
    </>
  )

  return <main className="min-h-screen bg-[#f6f8fc] text-[#172033]">
    <header className="sticky top-0 z-20 border-b border-[#e9edf5] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:h-[76px] sm:gap-8 sm:px-5 lg:px-10">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[#566176] hover:bg-[#f6f8fc] lg:hidden"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-1 text-xl font-bold tracking-tight sm:min-w-[190px] sm:gap-2 sm:text-[21px]">
          <span className="text-[#ff646b]">task</span><span>flow</span>
        </Link>
        <div className="relative hidden max-w-[610px] flex-1 md:block">
          <input aria-label="Search workspace" placeholder="Search your workspace..." className="h-11 w-full rounded-xl border border-[#edf0f5] bg-[#f8faff] px-4 text-sm outline-none focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button aria-label="Notifications" className="icon-button"><Bell className="size-[18px]" /></button>
          <button aria-label="Calendar" className="icon-button"><CalendarDays className="size-[18px]" /></button>
          <div className="hidden items-center gap-3 border-l border-[#edf0f5] pl-5 sm:flex">
            <div className="avatar bg-[#dbe8ff]">{initials || 'AM'}</div>
            <div className="hidden text-left lg:block"><p className="text-sm font-semibold">{fullname || 'Guest'}</p><p className="text-xs text-[#8b96a9]">Workspace admin</p></div>
          </div>
        </div>
      </div>
    </header>
    <div className="mx-auto flex max-w-[1500px] gap-8 px-4 py-5 sm:px-5 sm:py-7 lg:px-10">
      <aside className="hidden w-[220px] shrink-0 flex-col lg:flex">{sidebar}</aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-40 lg:hidden">
        <button
          type="button"
          className="absolute inset-0 size-full bg-slate-950/40"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="sidebar-scroll absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col overflow-y-auto bg-[#f6f8fc] p-4 shadow-2xl"
        >
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-xl text-[#566176] hover:bg-white"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          {sidebar}
        </aside>
      </div>
    )}
  </main>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#ff646b]">{eyebrow}</p><h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-[38px]">{title}</h1><p className="mt-2 text-sm text-[#7f8a9e]">{description}</p></div>{action}</div> }
