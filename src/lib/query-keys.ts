import { queryOptions } from '@tanstack/react-query'
import { fetchReleases } from '@/lib/releases/queries'
import { CACHE } from '@/constants'

export const userRouteContextQueryKey = ['auth', 'user-route-context'] as const

export const releasesQueryOptions = () =>
  queryOptions({
    queryKey: ['releases'],
    queryFn: () => fetchReleases(),
    staleTime: CACHE.RELEASES_STALE_TIME,
  })
