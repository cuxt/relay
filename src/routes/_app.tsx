import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { getSession } from '@/lib/auth/session'
import { getSiteConfig } from '@/lib/site-config/queries'
import { AppLogo } from '@/components/layout/AppLogo'
import { UserMenu } from '@/components/layout/UserMenu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { mainMenuItems, filterMenuByRole } from '@/config/menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/hooks/useSidebar'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const [session, siteConfig] = await Promise.all([getSession(), getSiteConfig()])
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { user: session.user, session: session.session, siteConfig }
  },
  component: AppLayout,
})

function AppLayout() {
  const { user, session, siteConfig } = Route.useRouteContext()
  const { collapsed, ready, toggle } = useSidebarCollapsed()

  const filteredMainItems = filterMenuByRole(mainMenuItems, user.role ?? undefined)

  return (
    <div className="flex min-h-screen" style={{ visibility: ready ? 'visible' : 'hidden' }}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-20 flex flex-col bg-background border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <AppLogo collapsed={collapsed} siteConfig={siteConfig} />
        <div className={cn('flex flex-1 flex-col overflow-y-auto')}>
          <TooltipProvider>
            <SidebarNav items={filteredMainItems} collapsed={collapsed} />
          </TooltipProvider>
        </div>
        <div className="h-2" />
      </aside>

      {/* Main */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'ml-16' : 'ml-56'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              首页
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              控制台
            </Link>
            <Link
              to="/release"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              更新日志
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu user={user} impersonating={!!session.impersonatedBy} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
