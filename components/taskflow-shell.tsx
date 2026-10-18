'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, CalendarDays, ChartNoAxesCombined, CircleHelp, FileText, FolderOpen, GitBranch, LayoutDashboard, LogOut, MessageSquare, Settings, Sparkles, Users, Workflow, CreditCard } from 'lucide-react'

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Automations', href: '/automations', icon: Sparkles },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Files', href: '/files', icon: FolderOpen },
  { label: 'Docs', href: '/docs', icon: FileText },
  { label: 'Users management', href: '/users-management', icon: Users },
  { label: 'Payments', href: '/payments', icon: CreditCard },
]

export function TaskflowShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return <main className="min-h-screen bg-[#f6f8fc] text-[#172033]">
    <header className="sticky top-0 z-20 border-b border-[#e9edf5] bg-white/95 backdrop-blur"><div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-8 px-5 lg:px-10"><Link href="/" className="flex min-w-[190px] items-center gap-2 text-[21px] font-bold tracking-tight"><span className="text-[#ff646b]">task</span><span>flow</span></Link><div className="relative hidden max-w-[610px] flex-1 md:block"><input aria-label="Search workspace" placeholder="Search your workspace..." className="h-11 w-full rounded-xl border border-[#edf0f5] bg-[#f8faff] px-4 text-sm outline-none focus:border-[#ff646b] focus:ring-4 focus:ring-[#ff646b]/10" /></div><div className="ml-auto flex items-center gap-3"><button aria-label="Notifications" className="icon-button"><Bell className="size-[18px]" /></button><button aria-label="Calendar" className="icon-button"><CalendarDays className="size-[18px]" /></button><div className="hidden items-center gap-3 border-l border-[#edf0f5] pl-5 sm:flex"><div className="avatar bg-[#dbe8ff]">AM</div><div className="hidden text-left lg:block"><p className="text-sm font-semibold">Amanuel</p><p className="text-xs text-[#8b96a9]">Workspace admin</p></div></div></div></div></header>
    <div className="mx-auto flex max-w-[1500px] gap-8 px-5 py-7 lg:px-10"><aside className="hidden w-[220px] shrink-0 flex-col lg:flex"><div className="mb-7 rounded-2xl bg-[#172033] p-5 text-white shadow-xl shadow-[#172033]/10"><div className="mb-5 flex items-center justify-between"><div className="avatar bg-[#ff8b88] text-white">AM</div><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-[#bfc8d8]">PRO</span></div><p className="font-semibold">Good morning, Amanuel</p><p className="mt-1 text-xs text-[#aeb9cc]">Let&apos;s make today productive.</p></div><nav className="space-y-1">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`side-link ${pathname === href ? 'side-link-active' : ''}`}><Icon className="size-[17px]" />{label}</Link>)}</nav><div className="mt-auto space-y-1 pt-8"><Link href="/settings" className="side-link"><Settings className="size-[18px]" />Settings</Link><button className="side-link"><CircleHelp className="size-[18px]" />Help center</button><Link href="/signin" className="side-link text-[#ff646b]"><LogOut className="size-[18px]" />Log out</Link></div></aside><section className="min-w-0 flex-1">{children}</section></div>
  </main>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#ff646b]">{eyebrow}</p><h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-[38px]">{title}</h1><p className="mt-2 text-sm text-[#7f8a9e]">{description}</p></div>{action}</div> }
