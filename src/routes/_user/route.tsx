import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
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
import { Logo } from '@/components/x/logo'
import { CACHE } from '@/constants'
import { filterMenuByRole, mainMenuItems } from '@/config/menu'
import { requireSession, sessionKey } from '@/lib/auth/session'
import { useSidebarStore } from '@/stores/sidebarStore'

export const Route = createFileRoute('/_user')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: sessionKey,
      queryFn: requireSession,
      staleTime: CACHE.USER_ROUTE_STALE_TIME,
    })

    return session
  },
  staleTime: CACHE.USER_ROUTE_STALE_TIME,
  preloadStaleTime: CACHE.USER_ROUTE_STALE_TIME,
  component: AppLayout,
})

function AppLayout() {
  const { user, session } = Route.useRouteContext()
  const location = useLocation()
  const collapsed = useSidebarStore((state) => state.collapsed)
  const setCollapsed = useSidebarStore((state) => state.setCollapsed)
  const items = filterMenuByRole(mainMenuItems, user.role ?? undefined)

  return (
    <SidebarProvider
      defaultOpen={!collapsed}
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <div className="flex h-svh w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarContent className="p-0">
            <SidebarHeader>
              <LogoArea />
            </SidebarHeader>
            <TooltipProvider>
              <MainNav items={items} location={location} />
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
  return <Logo variant={state === 'collapsed' ? 'icon' : 'full'} />
}

function MainNav({
  items,
  location,
}: {
  items: ReturnType<typeof filterMenuByRole>
  location: ReturnType<typeof useLocation>
}) {
  const { setOpenMobile, isMobile } = useSidebar()
  const close = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <>
      {items.map((item) => (
        <SidebarGroup key={item.key}>
          {item.children ? <SidebarGroupLabel>{item.label}</SidebarGroupLabel> : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {(item.children ?? [item]).map((child) => (
                <SidebarMenuItem key={child.key}>
                  <SidebarMenuButton
                    isActive={location.pathname === child.to}
                    tooltip={child.label}
                    render={<Link to={child.to!} />}
                    onClick={close}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
