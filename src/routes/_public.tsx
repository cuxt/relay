import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { getSiteConfig } from '@/lib/site-config/queries'
import { SiteIcon } from '@/components/layout/SiteIcon'
import { authClient } from '@/lib/auth/client'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public')({
  beforeLoad: async () => {
    const siteConfig = await getSiteConfig()
    return { siteConfig }
  },
  component: PublicLayout,
})

function PublicLayout() {
  const { siteConfig } = Route.useRouteContext()
  const { data: session } = authClient.useSession()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 md:px-12 border-b border-border backdrop-blur-md bg-background/90">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <SiteIcon
              iconType={siteConfig.iconType}
              iconValue={siteConfig.iconValue}
              className="h-4 w-4"
            />
          </div>
          <span className="text-base font-semibold text-foreground">{siteConfig.siteName}</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <UserMenu user={session.user} impersonating={!!session.session.impersonatedBy} />
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="rounded-full">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full">注册</Button>
              </Link>
            </>
          )}
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        {siteConfig.siteName} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
