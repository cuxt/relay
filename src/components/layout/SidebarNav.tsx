import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/config/menu'

interface SidebarNavProps {
  items: MenuItem[]
  collapsed?: boolean
}

export function SidebarNav({ items, collapsed }: SidebarNavProps) {
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState<string[]>(['settings'])

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const isActive = (to?: string) => {
    if (!to) return false
    return location.pathname === to
  }

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        if (item.children) {
          const isOpen = openGroups.includes(item.key)
          const hasActiveChild = item.children.some((child) => isActive(child.to))

          return (
            <div key={item.key} className="relative group/menu">
              <button
                onClick={() => !collapsed && toggleGroup(item.key)}
                className={cn(
                  'flex w-full items-center rounded-lg py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                  hasActiveChild && 'text-foreground',
                  !hasActiveChild && 'text-sidebar-foreground/70',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                )}
              >
                {item.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                    />
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
                  {item.children.map((child) => (
                    <NavLink key={child.key} item={child} active={isActive(child.to)} />
                  ))}
                </div>
              )}
              {collapsed && (
                <div className="invisible opacity-0 group-hover/menu:visible group-hover/menu:opacity-100 transition-all duration-150 fixed left-17 -mt-9 z-50 min-w-40 rounded-lg border border-border bg-popover p-1 shadow-md">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <NavLink key={child.key} item={child} active={isActive(child.to)} />
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <NavLink key={item.key} item={item} active={isActive(item.to)} collapsed={collapsed} />
        )
      })}
    </nav>
  )
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: MenuItem
  active: boolean
  collapsed?: boolean
}) {
  if (item.external) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center rounded-lg py-2 text-sm transition-colors hover:bg-sidebar-accent',
          'text-sidebar-foreground/70',
          collapsed ? 'justify-center px-2' : 'gap-3 px-3'
        )}
      >
        {item.icon}
        {!collapsed && <span>{item.label}</span>}
      </a>
    )
  }

  return (
    <Link
      to={item.to!}
      className={cn(
        'flex items-center rounded-lg py-2 text-sm transition-colors hover:bg-sidebar-accent',
        active ? 'bg-sidebar-accent text-foreground font-medium' : 'text-sidebar-foreground/70',
        collapsed ? 'justify-center px-2' : 'gap-3 px-3'
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}
