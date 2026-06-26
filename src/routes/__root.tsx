import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster as Sonner } from 'sonner'
import { ThemeProvider, useTheme } from '@/hooks/use-theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { siteConfig } from '@/config/site'
import { I18N } from '@/constants'
import appCSS from '@/styles.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  ssr: true,
  head: () => {
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: siteConfig.name },
        { name: 'description', content: siteConfig.description },
      ],
      links: [
        { rel: 'icon', href: '/favicon.svg' },
        { rel: 'stylesheet', href: appCSS },
      ],
    }
  },
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center font-sans">
      <h1 className="text-[120px] font-extrabold text-primary/15 leading-none select-none">404</h1>
      <h2 className="text-2xl font-bold -mt-5">页面未找到</h2>
      <p className="text-base text-muted-foreground mt-3 mb-8 max-w-100">
        抱歉，你访问的页面不存在。请检查 URL 或返回首页。
      </p>
      <a
        href="/"
        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium no-underline hover:bg-primary/90 transition-colors"
      >
        返回首页
      </a>
    </div>
  ),
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
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={I18N.LOCALE}>
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
