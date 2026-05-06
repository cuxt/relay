import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Settings, MonitorPlay } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getSiteConfig } from '@/lib/site-config/queries'
import { UserMenu } from '@/components/layout/user-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { mainMenuItems, filterMenuByRole } from '@/config/menu'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'
import { cn } from '@/lib/utils'

const getSidebarOpen = createServerFn({ method: 'GET' }).handler(() => {
  const cookie = getRequestHeaders().get('cookie')
  const sidebarState = cookie
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('sidebar_state='))
    ?.split('=')[1]

  return sidebarState === undefined ? true : sidebarState === 'true'
})

// TanStack Query 缓存 hooks
function useSiteConfig() {
  return useQuery({
    queryKey: ['site-config'],
    queryFn: () => getSiteConfig(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    const sidebarOpen = await getSidebarOpen()
    return { user: session.user, session: session.session, sidebarOpen }
  },
  component: AppLayout,
})

function AppLayout() {
  const { user, session, sidebarOpen } = Route.useRouteContext()
  const { data: siteConfig } = useSiteConfig()
  const location = useLocation()
  const isSystemRoute = location.pathname.startsWith('/system')

  const filteredMainItems = filterMenuByRole(mainMenuItems, user.role ?? undefined)

  return (
    <div>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarLogo siteConfig={siteConfig} />
          </SidebarHeader>
          <SidebarContent>
            <TooltipProvider>
              {isSystemRoute ? (
                <SystemSidebarContent location={location} />
              ) : (
                <MainSidebarContent items={filteredMainItems} location={location} />
              )}
            </TooltipProvider>
          </SidebarContent>
        </Sidebar>

        <AppContent user={user} session={session} />
      </SidebarProvider>
    </div>
  )
}

function SidebarLogo({ siteConfig }: { siteConfig?: { siteName: string; iconType: string; iconValue: string } }) {
  const { state } = useSidebar()
  return (
    <Logo
      siteConfig={siteConfig ?? { siteName: '...', iconType: 'lucide', iconValue: 'loader' }}
      collapsed={state === 'collapsed'}
    />
  )
}

function SystemSidebarContent({ location }: { location: ReturnType<typeof useLocation> }) {
  const { state } = useSidebar()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isCollapsed = state === 'collapsed'

  const systemMenuItems = [
    {
      label: '常规',
      icon: Settings,
      children: [{ label: '系统信息', to: '/system/info' as const }],
    },
    {
      label: '维护',
      icon: MonitorPlay,
      children: [{ label: '系统维护', to: '/system/maintenance' as const }],
    },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>系统管理</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {systemMenuItems.map((item, index) => (
            <SidebarMenuItem key={item.label}>
              {isCollapsed && item.children.length > 0 ? (
                <Popover
                  open={openIndex === index}
                  onOpenChange={(open) => setOpenIndex(open ? index : null)}
                >
                  <PopoverTrigger
                    render={
                      <SidebarMenuButton tooltip={item.label}>
                        <item.icon className="h-4 w-4" />
                      </SidebarMenuButton>
                    }
                  />
                  <PopoverContent side="right" align="start" sideOffset={8} className="w-40 p-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={() => setOpenIndex(null)}
                        className={cn(
                          'flex items-center px-3 py-1.5 text-sm rounded-sm transition-colors',
                          location.pathname === child.to
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </PopoverContent>
                </Popover>
              ) : (
                <>
                  <SidebarMenuButton tooltip={item.label}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {!isCollapsed && item.children.length > 0 && (
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.to}>
                          <SidebarMenuSubButton
                            isActive={location.pathname === child.to}
                            render={<Link to={child.to} />}
                          >
                            {child.label}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function MainSidebarContent({
  items,
  location,
}: {
  items: ReturnType<typeof filterMenuByRole>
  location: ReturnType<typeof useLocation>
}) {
  return (
    <>
      {items.map((item) => {
        if (item.children) {
          return (
            <SidebarGroup key={item.key}>
              <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.key}>
                      <SidebarMenuButton
                        isActive={location.pathname === child.to}
                        tooltip={child.label}
                        render={<Link to={child.to!} />}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        }
        return (
          <SidebarGroup key={item.key}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.to}
                    tooltip={item.label}
                    render={<Link to={item.to!} />}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      })}
    </>
  )
}

function AppContent({
  user,
  session,
}: {
  user: { name: string; email: string; image?: string | null; role?: string | null }
  session: { impersonatedBy?: string | null }
}) {
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <div className="flex flex-1 flex-col">
      <header className="shrink-0 flex h-16 items-center justify-between gap-3 border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
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

      <main className="flex-1 min-h-0 p-6">
        <Outlet />
      </main>
    </div>
  )
}
