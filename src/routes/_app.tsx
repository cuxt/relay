import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getSiteConfig } from '@/lib/site-config/queries'
import { AppLogo } from '@/components/layout/AppLogo'
import { UserMenu } from '@/components/layout/UserMenu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { mainMenuItems, footerMenuItems, filterMenuByRole } from '@/config/menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const [session, siteConfig] = await Promise.all([
      getSession(),
      getSiteConfig(),
    ])
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { user: session.user, session: session.session, siteConfig }
  },
  component: AppLayout
})

function AppLayout() {
  const { user, session, siteConfig } = Route.useRouteContext()
  const [collapsed, setCollapsed] = useState(false)

  const filteredMainItems = filterMenuByRole(
    mainMenuItems,
    user.role ?? undefined
  )

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-20 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-17' : 'w-64'
        )}
      >
        <AppLogo collapsed={collapsed} siteConfig={siteConfig} />
        <div
          className={cn(
            'flex flex-1 flex-col',
            collapsed ? 'overflow-visible' : 'overflow-y-auto'
          )}
        >
          <SidebarNav items={filteredMainItems} collapsed={collapsed} />
        </div>
        <Separator />
        <SidebarNav items={footerMenuItems} collapsed={collapsed} />
        <div className="h-2" />
      </aside>

      {/* Main */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'ml-17' : 'ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-6 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
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
