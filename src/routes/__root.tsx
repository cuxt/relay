import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet
} from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Link } from '@tanstack/react-router'

import Header from '../components/Header'
import { ThemeProvider } from '@/components/theme'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Relay'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound
})

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">页面未找到</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col h-screen bg-background font-sans antialiased overflow-hidden">
        <ThemeProvider defaultTheme="system" storageKey="relay-theme">
          <Header />
          <main className="flex h-full overflow-hidden">
            <Outlet />
          </main>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
          />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
