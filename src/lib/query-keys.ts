import { queryOptions } from '@tanstack/react-query'
import { fetchReleases } from '@/lib/releases/queries'

export const userRouteContextQueryKey = ['auth', 'user-route-context'] as const

export const releasesQueryOptions = () =>
  queryOptions({
    queryKey: ['releases'],
    queryFn: () => fetchReleases(),
    staleTime: 1000 * 60 * 30,
  })
