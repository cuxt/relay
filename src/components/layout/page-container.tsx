import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ContainerWidth = 'narrow' | 'medium' | 'wide' | 'full'

const widthClasses: Record<ContainerWidth, string> = {
  narrow: 'max-w-2xl',
  medium: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-full'
}

interface PageContainerProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  width?: ContainerWidth
  /** Show a back button linking to this path */
  backTo?: string
  backLabel?: string
}

export function PageContainer({
  title,
  description,
  action,
  children,
  className,
  width = 'wide',
  backTo,
  backLabel = '返回'
}: PageContainerProps) {

  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      <div className={cn('mx-auto px-6 py-8', widthClasses[width])}>
        {backTo && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <Link to={backTo}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        )}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
