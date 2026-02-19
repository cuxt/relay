import { useState } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/shared/copy-button'
import { cn } from '@/lib/utils'

interface TokenDisplayProps {
  token: string
  onRegenerate?: () => void
  regenerating?: boolean
  className?: string
}

export function TokenDisplay({
  token,
  onRegenerate,
  regenerating,
  className
}: TokenDisplayProps) {
  const [visible, setVisible] = useState(false)

  const masked = `${token.slice(0, 8)}${'*'.repeat(16)}${token.slice(-4)}`
  const pushUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/push/${token}`
      : `/api/push/${token}`

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2',
        className
      )}
    >
      <code className="text-xs font-mono flex-1 truncate">
        {visible ? token : masked}
      </code>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </Button>
        <CopyButton value={pushUrl} className="h-7 w-7" />
        {onRegenerate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onRegenerate}
            disabled={regenerating}
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', regenerating && 'animate-spin')}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
