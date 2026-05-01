import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { Settings, MonitorPlay, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getSiteConfig, getSystemInfo } from '@/lib/site-config/queries'
import { AppLogo } from '@/components/layout/AppLogo'
import { useSidebarCollapsed } from '@/hooks/useSidebar'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/_app/system')({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
    const [siteConfig, systemInfo] = await Promise.all([getSiteConfig(), getSystemInfo()])
    return { siteConfig, systemInfo }
  },
  component: SystemLayout,
})

function SystemLayout() {
  const { siteConfig } = Route.useRouteContext()
  const { collapsed, ready } = useSidebarCollapsed()
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Always close menu on route change
  useEffect(() => {
    setExpandedSection(null)
  }, [location.pathname])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  useEffect(() => {
    if (!collapsed || !expandedSection) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExpandedSection(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [collapsed, expandedSection])

  const sections = [
    {
      key: '常规',
      icon: <Settings className="h-4 w-4" />,
      children: [{ label: '系统信息', to: '/system/info' }],
    },
    {
      key: '维护',
      icon: <MonitorPlay className="h-4 w-4" />,
      children: [{ label: '系统维护', to: '/system/maintenance' }],
    },
  ]

  // Return loading state after all hooks are called
  return (
    <div className="flex min-h-screen" style={{ visibility: ready ? 'visible' : 'hidden' }}>
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-20 flex flex-col bg-background border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <AppLogo collapsed={collapsed} siteConfig={siteConfig} />

        <nav className={cn('flex flex-col', collapsed ? 'gap-3 py-2 px-1.5' : 'gap-5 px-3 py-2')}>
          {!collapsed && (
            <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/50">
              系统管理
            </p>
          )}

          {sections.map((section) => (
            <div key={section.key} className="flex flex-col gap-0.5">
              <CollapsibleNavButton
                icon={section.icon}
                label={section.key}
                expanded={expandedSection === section.key}
                onToggle={() => toggleSection(section.key)}
                collapsed={collapsed}
              />

              {!collapsed && expandedSection === section.key && (
                <div className="pl-6 flex flex-col gap-0.5">
                  {section.children.map((child) => (
                    <SystemNavLink
                      key={child.to}
                      to={child.to}
                      label={child.label}
                      onClick={() => setExpandedSection(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {collapsed && expandedSection && (
          <div
            ref={dropdownRef}
            className="absolute left-16 top-0 w-40 bg-background border border-border rounded-md shadow-lg py-1 px-1 z-50"
            style={{ marginTop: '4rem' }}
          >
            <div className="px-3 py-2 text-[13px] font-medium text-foreground border-b border-border">
              {expandedSection}
            </div>
            {sections
              .find((s) => s.key === expandedSection)
              ?.children.map((child) => (
                <SystemNavLink
                  key={child.to}
                  to={child.to}
                  label={child.label}
                  onClick={() => setExpandedSection(null)}
                />
              ))}
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}

function CollapsibleNavButton({
  icon,
  label,
  expanded,
  onToggle,
  collapsed,
}: {
  icon: React.ReactNode
  label: string
  expanded: boolean
  onToggle: () => void
  collapsed?: boolean
}) {
  const content = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center rounded-md py-1.5 text-[13px] transition-colors',
        expanded
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5'
      )}
    >
      <span className="shrink-0 flex items-center justify-center h-4 w-4">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          <ChevronRight
            className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-90')}
          />
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<div className="flex justify-center">{content}</div>} />
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}

function SystemNavLink({
  to,
  label,
  onClick,
}: {
  to: string
  label: string
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center rounded-md py-1.5 px-2.5 text-[13px] transition-colors',
        isActive
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {label}
    </Link>
  )
}
