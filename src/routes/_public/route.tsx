import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import { SiteIcon } from '@/components/layout/site-icon'
import { authClient } from '@/lib/auth/client'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/dashboard', label: '控制台' },
  { to: '/release', label: '更新日志' },
]

function PublicLayout() {
  const siteName = import.meta.env.VITE_SITE_NAME || 'Start Template'
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const { data: session } = authClient.useSession()
  const [compact, setCompact] = useState(false)
  const hasScrolled = useRef(false)

  useEffect(() => {
    if (window.scrollY > 50) {
      hasScrolled.current = true
      setCompact(true)
    }

    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 10) {
        hasScrolled.current = false
        setCompact(false)
      } else if (currentScrollY > lastScrollY && !hasScrolled.current) {
        hasScrolled.current = true
        setCompact(true)
      } else if (hasScrolled.current && currentScrollY < lastScrollY && currentScrollY < 80) {
        setCompact(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-background text-foreground relative min-h-svh overflow-x-clip">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div
          className={`pointer-events-auto mx-auto px-4 pt-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            compact ? 'max-w-208 px-3 pt-3' : 'max-w-7xl md:px-6'
          }`}
        >
          <nav
            className={`flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              compact
                ? 'bg-background/60 ring-border/50 h-12 rounded-2xl pr-1.5 pl-4 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.02)] ring-[0.5px] backdrop-blur-2xl dark:shadow-[0_2px_16px_-6px_rgba(0,0,0,0.4)]'
                : 'h-16 px-2'
            }`}
          >
            <Link to="/" className="group flex shrink-0 items-center gap-2.5 no-underline">
              <div className="flex size-7 shrink-0 items-center justify-center transition-all duration-300 group-hover:scale-105">
                <SiteIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">{siteName}</span>
            </Link>

            <div className="hidden items-center gap-0.5 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="bg-border/40 mx-2 h-4 w-px" />
              <ThemeToggle />
              {session ? (
                <UserMenu user={session.user} impersonating={!!session.session.impersonatedBy} />
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="rounded-full h-8 text-[13px] px-3">
                      登录
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="rounded-full h-8 text-[13px] px-3">注册</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

            {!isAuthPage && (
        <footer className="border-border/40 relative z-10 border-t">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-muted-foreground/40 text-xs">
              &copy; {new Date().getFullYear()} {siteName}. 版权所有。
            </p>
            <p className="text-muted-foreground/45 text-center text-xs sm:text-right">
              &copy; {new Date().getFullYear()} cuxt. 版权所有，由项目贡献者设计与开发。
            </p>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
