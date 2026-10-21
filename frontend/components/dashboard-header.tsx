'use client'

import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Brand } from '@/components/ui/brand'
import { getProfile } from '@/lib/api/auth'
import type { UserProfile } from '@/lib/types/api'


function DashboardHeader({
  onMobileMenu,
  isMobileMenuOpen = false,
}: {
  onMobileMenu?: () => void
  isMobileMenuOpen?: boolean
}) {

  const fetchProfile = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const payload = await getProfile()
      if (!payload.data) {
        throw new Error('Profile payload was empty')
      }
      return payload.data
    },
  })

  const fullname = fetchProfile.data?.fullname
  const initials = fullname
    ? fullname
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : ''

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
