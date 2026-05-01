import { cn } from '@/lib/utils'
import { SiteIcon } from './SiteIcon'
import type { SiteConfig } from '@/lib/site-config/queries'
import packageJson from '../../../package.json'

interface AppLogoProps {
  collapsed?: boolean
  siteConfig: SiteConfig
}

export function AppLogo({ collapsed, siteConfig }: AppLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center overflow-hidden whitespace-nowrap py-4 gap-3',
        collapsed ? 'justify-center px-0' : 'px-4'
      )}
    >
      {siteConfig.iconType === 'lucide' ? (
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center shrink-0">
          <SiteIcon iconType={siteConfig.iconType} iconValue={siteConfig.iconValue} className="text-background" />
        </div>
      ) : (
        <SiteIcon
          iconType={siteConfig.iconType}
          iconValue={siteConfig.iconValue}
          className="h-7 w-7"
        />
      )}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold leading-tight">{siteConfig.siteName}</span>
          <span className="text-[11px] text-muted-foreground/60">v{packageJson.version}</span>
        </div>
      )}
    </div>
  )
}