import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { CACHE } from '@/constants'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE.DEFAULT_STALE_TIME,
        retry: 1,
      },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: CACHE.DEFAULT_PRELOAD_STALE_TIME,
    context: { queryClient },
  })

  return routerWithQueryClient(router, queryClient)
}

export function getRouter() {
  return createRouter()
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
