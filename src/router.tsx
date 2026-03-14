import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error?.message || '操作失败')
      },
    }),
  })

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
  })

  return router
}

export function getRouter() {
  return createRouter()
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
