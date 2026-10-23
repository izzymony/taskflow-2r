'use client'

import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/api/auth'
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
  })

  const fullname = query.data?.fullname
  const firstName = fullname?.split(' ').filter(Boolean)[0]
  const initials = fullname
    ? fullname
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : ''

  return { ...query, fullname, firstName, initials }
}
