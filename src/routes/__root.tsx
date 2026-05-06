/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster as Sonner } from 'sonner'
import { ThemeProvider, useTheme } from '@/hooks/use-theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getSiteConfig } from '@/lib/site-config/queries'
import appCSS from '@/styles.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const siteConfig = await getSiteConfig()
    return { siteConfig }
  },
  head: ({ match }) => {
    const { siteConfig } = match.context as { siteConfig: { siteName: string } }
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: siteConfig.siteName },
        { name: 'description', content: '通用全栈起步模板' },
      ],
      links: [
        { rel: 'icon', href: '/api/favicon' },
        { rel: 'stylesheet', href: appCSS },
      ],
    }
  },
  component: RootComponent,
  errorComponent: RootErrorComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <RootDocument>
      <ThemeProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Outlet />
            <AppToaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </RootDocument>
  )
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <RootDocument>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 font-sans">
        <h1 className="text-5xl font-bold text-destructive">500</h1>
        <p className="text-lg text-muted-foreground mb-6">服务器出现了错误</p>
        <pre className="p-4 rounded-lg bg-muted max-w-150 overflow-auto text-[13px]">
          {error.message}
        </pre>
        <a
          href="/"
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium no-underline hover:bg-primary/90 transition-colors"
        >
          返回首页
        </a>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function AppToaster() {
  const { resolvedMode } = useTheme()

  return <Sonner theme={resolvedMode as 'light' | 'dark' | 'system'} richColors />
}
