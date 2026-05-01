import { useLocation } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/config/menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarNavProps {
  items: MenuItem[]
  collapsed?: boolean
}

export function SidebarNav({ items, collapsed }: SidebarNavProps) {
  const location = useLocation()

  const isActive = (to?: string) => {
    if (!to) return false
    return location.pathname === to
  }

  return (
    <nav className={cn('flex flex-col', collapsed ? 'gap-6 py-2' : 'gap-5 px-3 py-2')}>
      {items.map((item) => {
        if (item.children) {
          return (
            <div key={item.key} className="flex flex-col gap-0.5">
              {!collapsed && (
                <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/50">
                  {item.label}
                </p>
              )}
              {item.children.map((child) => (
                <NavLink
                  key={child.key}
                  item={child}
                  active={isActive(child.to)}
                  collapsed={collapsed}
                />
              ))}
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
  const baseClass = cn(
    'group flex items-center rounded-md py-1.5 text-[13px] transition-colors',
    active
      ? 'bg-accent text-foreground font-medium'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  )

  const linkContent = (className: string) => (
    <>
      {item.icon && (
        <span className={cn('shrink-0 flex items-center justify-center', className)}>
          {item.icon}
        </span>
      )}
      {!collapsed && <span>{item.label}</span>}
    </>
  )

  if (item.external) {
    const content = (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClass, collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5')}
      >
        {linkContent(collapsed ? 'h-7 w-7' : 'h-4 w-4')}
      </a>
    )
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger render={<div className="flex justify-center">{content}</div>} />
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      )
    }
    return content
  }

  const content = (
    <Link
      to={item.to!}
      className={cn(baseClass, collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5')}
    >
      {linkContent(collapsed ? 'h-7 w-7' : 'h-4 w-4')}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div className="flex justify-center">{content}</div>} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
