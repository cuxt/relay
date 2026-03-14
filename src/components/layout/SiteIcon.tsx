import { icons } from 'lucide-react'
import { cn } from '@/lib/utils'

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

interface SiteIconProps {
  iconType: string
  iconValue: string
  className?: string
  containerClassName?: string
}

export function SiteIcon({
  iconType,
  iconValue,
  className,
  containerClassName,
}: SiteIconProps) {
  const renderLucideIcon = () => {
    const name = kebabToPascal(iconValue) as keyof typeof icons
    const Icon = icons[name]
    if (!Icon) return null
    return (
      <Icon
        className={cn('h-4.5 w-4.5 text-primary-foreground', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0',
        containerClassName,
      )}
    >
      {iconType === 'lucide' && renderLucideIcon()}
      {iconType === 'url' && (
        <img
          src={iconValue}
          alt="Site icon"
          className={cn('h-4.5 w-4.5 object-contain rounded-lg', className)}
        />
      )}
      {iconType === 'emoji' && (
        <span className={cn('text-lg leading-none flex items-center justify-center', className)}>
          {iconValue}
        </span>
      )}
    </div>
  )
}
