import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

interface LogoProps {
  /**
   * 显示变体
   * - full: 图标 + 站点名（默认）
   * - icon: 仅图标
   */
  variant?: 'full' | 'icon'
  className?: string
}

export function Logo({ variant = 'full', className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2.5 no-underline',
        variant === 'icon' && 'justify-center',
        className,
      )}
    >
      <div className={cn('shrink-0', variant === 'icon' ? 'w-5 h-5' : 'w-5 h-5')}>
        <img
          src="/favicon.svg"
          alt={siteConfig.name}
          className="w-full h-full object-contain"
        />
      </div>
      {variant === 'full' && (
        <span className="text-[15px] font-semibold leading-tight whitespace-nowrap">
          {siteConfig.name}
        </span>
      )}
    </Link>
  )
}
