import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SiteIcon } from './site-icon'

interface LogoProps {
  /** 折叠状态，默认 false */
  collapsed?: boolean
}

export function Logo({ collapsed }: LogoProps) {
  const siteName = import.meta.env.VITE_SITE_NAME || 'Start Template'

  return (
    <Link
      to="/"
      className={cn(
        'flex items-center overflow-hidden whitespace-nowrap gap-3 no-underline',
        collapsed ? 'justify-center' : 'px-2'
      )}
    >
      <div className="w-5 h-5 shrink-0">
        <SiteIcon />
      </div>
      {!collapsed && (
        <span className="text-[15px] font-semibold leading-tight">{siteName}</span>
      )}
    </Link>
  )
}
