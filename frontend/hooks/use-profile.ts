'use client'

import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/api/auth'
import { getStoredUser } from '@/lib/api/client'
import type { UserProfile } from '@/lib/types/api'

export function useProfile() {
  const query = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const payload = await getProfile()
      if (!payload.data) {
        throw new Error('Profile payload was empty')
      }
      return payload.data
    },
    initialData: () => getStoredUser<UserProfile>() ?? undefined,
    retry: 1,
    staleTime: 60 * 1000,
  })

  const storedUser = typeof window !== 'undefined' ? getStoredUser<UserProfile>() : null
  const effectiveUser = query.data ?? storedUser ?? undefined

  const fullname = effectiveUser?.fullname
  const firstName = fullname?.split(' ').filter(Boolean)[0]
  const initials = fullname
    ? fullname
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : ''

  return { ...query, data: effectiveUser, fullname, firstName, initials }
}
