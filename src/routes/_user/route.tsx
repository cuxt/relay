import { createFileRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { userRouteContextQueryKey } from '@/lib/query-keys'
import { UserMenu } from '@/components/layout/user-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { mainMenuItems, filterMenuByRole } from '@/config/menu'
import { Logo } from '@/components/layout/logo'
import { useIsMobile } from '@/hooks/use-mobile'
import { authMiddleware } from '@/middleware/auth'

const USER_ROUTE_STALE_TIME = Infinity

const getUserRouteContext = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context: { user, session } }) => {
    const headers = getRequestHeaders()
    const cookie = headers.get('cookie')
    const sidebarState = cookie
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('sidebar_state='))
      ?.split('=')[1]

    return {
      user: user,
      session: session,
      sidebarOpen: sidebarState === undefined ? true : sidebarState === 'true',
    }
  })

export const Route = createFileRoute('/_user')({
  beforeLoad: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: userRouteContextQueryKey,
      queryFn: () => getUserRouteContext(),
      staleTime: USER_ROUTE_STALE_TIME,
    })
  },
  staleTime: USER_ROUTE_STALE_TIME,
  preloadStaleTime: USER_ROUTE_STALE_TIME,
  component: AppLayout,
})

function AppLayout() {
  const { user, session, sidebarOpen } = Route.useRouteContext()
  const location = useLocation()
  const isMobile = useIsMobile()
  const filteredMainItems = filterMenuByRole(mainMenuItems, user.role ?? undefined)

  return (
    <SidebarProvider defaultOpen={isMobile ? false : sidebarOpen}>
      <div className="flex h-svh w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarContent className="p-0">
            <SidebarHeader>
              <LogoArea />
            </SidebarHeader>
            <TooltipProvider>
              <MainSidebarContent items={filteredMainItems} location={location} />
            </TooltipProvider>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 px-4">
            <SidebarTrigger className="size-8" />
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <UserMenu user={user} impersonating={!!session.impersonatedBy} />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function LogoArea() {
  const { state } = useSidebar()

  return <Logo collapsed={state === 'collapsed'} />
}

function MainSidebarContent({
  items,
  location,
}: {
  items: ReturnType<typeof filterMenuByRole>
  location: ReturnType<typeof useLocation>
}) {
  const { setOpenMobile, isMobile } = useSidebar()

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
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(false)
                          }
                        }}
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
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false)
                      }
                    }}
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
