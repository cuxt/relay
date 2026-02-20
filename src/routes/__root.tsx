import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
  isRedirect
} from '@tanstack/react-router'

import { ThemeProvider } from '@/components/theme'
import { AppHeader } from '@/components/layout/app-header'
import { AnimatedOutlet } from '@/components/layout/animated-outlet'
import { getSession } from '@/lib/auth/auth.server'
import { Toaster } from 'sonner'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const publicRoutes = [
  '/auth/login',
  '/auth/sign-up',
  '/api/auth/',
  '/api/push/'
]

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Relay' }
    ],
    links: [{ rel: 'stylesheet', href: appCss }]
  }),

  beforeLoad: async ({ location }) => {
    const isPublicRoute = publicRoutes.some(route =>
      location.pathname.startsWith(route)
    )

    if (!isPublicRoute) {
      try {
        const session = await getSession()
        if (!session) {
          throw redirect({ to: '/auth/login' })
        }
      } catch (error) {
        if (isRedirect(error)) {
          throw error
        }
        throw redirect({ to: '/auth/login' })
      }
    }
  },

  shellComponent: RootDocument,
  notFoundComponent: NotFound
})

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
        <p className="text-muted-foreground">页面未找到</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

function RootDocument() {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col h-screen bg-background font-sans antialiased overflow-hidden">
        <ThemeProvider defaultTheme="system" storageKey="relay-theme">
          <AppHeader />
          <main className="flex flex-col flex-1 overflow-hidden">
            <AnimatedOutlet />
          </main>
          <Toaster position="bottom-right" richColors closeButton />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
