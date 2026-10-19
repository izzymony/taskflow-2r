'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Circle,
  FileText,
  Folder,
  Home,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import type { ComponentType } from 'react'

import { Brand } from '@/components/ui/brand'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const mainNav: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tasks', label: 'Tasks', icon: LayoutGrid },
  { href: '/docs', label: 'Docs', icon: FileText },
  { href: '/schedule', label: 'Schedule', icon: Circle },
  { href: '/chat', label: 'Chat', icon: Users },
  { href: '/payments', label: 'Payments', icon: Folder },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/automations', label: 'Automations', icon: Settings },
  { href: '/user-management', label: 'User Management', icon: UserRound },
  { href: '/workflows', label: 'Workflows', icon: List },
]

const fileNav = ['Store', 'Company', 'Employee']

function Sidebar({
  onLogout,
  isMobileOpen = false,
  onClose,
}: {
  onLogout?: () => void
  isMobileOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()

  const sidebarContent = (
    <>
      <div className="px-3">
        <Brand />
      </div>
      <div className="relative mt-7">
        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
        <input
          aria-label="Search"
          placeholder="Search"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-violet-400"
        />
      </div>
      <nav className="mt-5 flex flex-col gap-1" aria-label="Main navigation">
        {mainNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-8 items-center gap-3 rounded-md px-3 text-xs font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-5 flex items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <span>File</span>
        <span className="flex gap-2 text-slate-500">
          <Plus className="size-3" />
          <MoreHorizontal className="size-3" />
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {fileNav.map((item) => (
          <button
            key={item}
            onClick={onClose}
            className="flex h-8 items-center gap-3 rounded-md px-3 text-xs text-slate-600 hover:bg-white"
          >
            <Folder className="size-3.5" />
            {item}
          </button>
        ))}
      </div>
      <div className="mt-auto border-t border-slate-200 px-3 pt-4">
        <button
          onClick={onLogout}
          className="text-xs font-medium text-slate-500 hover:text-violet-700"
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden w-[224px] shrink-0 border-r border-slate-200 bg-slate-50/80 px-3 py-5 lg:flex lg:flex-col">
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 size-full bg-slate-950/40"
            aria-label="Close navigation menu"
            onClick={onClose}
          />
          <aside
            id="mobile-navigation"
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
            className="sidebar-scroll absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-5 shadow-2xl"
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-white"
                aria-label="Close navigation menu"
                onClick={onClose}
              >
                <X className="size-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export { Sidebar, mainNav }
