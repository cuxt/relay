import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ContainerWidth = 'narrow' | 'medium' | 'wide' | 'full'

type BackTarget = {
  to: string
  params?: Record<string, string>
  search?: Record<string, unknown>
}

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
  backTo?: string | BackTarget
  backLabel?: string
}

function renderBackLink(backTo: string | BackTarget) {
  if (typeof backTo === 'string') {
    return <Link to={backTo} />
  }

  return <Link to={backTo.to} params={backTo.params} search={backTo.search} />
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
      <div className={cn('mx-auto px-4 sm:px-6 py-8', widthClasses[width])}>
        {backTo && (
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={renderBackLink(backTo)}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {backLabel}
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
