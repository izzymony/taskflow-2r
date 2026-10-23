'use client'

import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { Brand } from '@/components/ui/brand'
import { useProfile } from '@/hooks/use-profile'


function DashboardHeader({
  onMobileMenu,
  isMobileMenuOpen = false,
}: {
  onMobileMenu?: () => void
  isMobileMenuOpen?: boolean
}) {

  const { fullname, initials } = useProfile()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 px-5 sm:px-8">
      <button
        className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-50 lg:hidden"
        onClick={onMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        {isMobileMenuOpen ? (
          <X className="size-5 text-slate-600" />
        ) : (
          <Menu className="size-5 text-slate-600" />
        )}
      </button>
      <div className="flex items-center gap-3 lg:hidden">
        <Brand />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button aria-label="Notifications">
          <Bell className="size-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
            {initials}
          </span>
          <span className="hidden text-xs font-medium text-slate-700 sm:block">
            {fullname}
          </span>
          <ChevronDown className="size-3 text-slate-400" />
        </div>
      </div>
    </header>
  )
}

export { DashboardHeader }
