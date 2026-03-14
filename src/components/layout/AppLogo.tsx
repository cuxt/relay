import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SiteIcon } from './SiteIcon'
import type { SiteConfig } from '@/lib/site-config/queries'

interface AppLogoProps {
  collapsed?: boolean
  siteConfig: SiteConfig
}

export function AppLogo({ collapsed, siteConfig }: AppLogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center overflow-hidden whitespace-nowrap py-4 no-underline text-foreground',
        collapsed ? 'justify-center px-0' : 'gap-2.5 px-5'
      )}
    >
      {siteConfig.iconType === 'lucide' ? (
        <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shrink-0">
          <SiteIcon iconType={siteConfig.iconType} iconValue={siteConfig.iconValue} />
        </div>
      ) : (
        <SiteIcon
          iconType={siteConfig.iconType}
          iconValue={siteConfig.iconValue}
          className="h-9 w-9"
        />
      )}
      {!collapsed && <span className="text-base font-semibold">{siteConfig.siteName}</span>}
    </Link>
  )
}
