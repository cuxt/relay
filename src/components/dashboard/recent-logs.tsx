import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { usePushLogs } from '@/hooks/use-push-logs'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

export function RecentLogs() {
  const { data, isLoading } = usePushLogs({ limit: 5 })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">最近推送</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/logs">
            查看全部
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            暂无推送记录
          </div>
        ) : (
          <div className="space-y-2">
            {data.items.map((log: any) => (
              <Link
                key={log.id}
                to="/logs/$id"
                params={{ id: log.id }}
                className="flex items-center justify-between p-3 rounded-md bg-muted/50 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant={
                      log.status === 'success' ? 'default' : 'destructive'
                    }
                    className="text-xs shrink-0"
                  >
                    {log.status === 'success' ? '成功' : '失败'}
                  </Badge>
                  <span className="truncate">
                    {log.endpointName || '未知端点'}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {CHANNEL_TYPES[log.channelType as ChannelType]?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-2">
                  {log.latencyMs != null && <span>{log.latencyMs}ms</span>}
                  <span>
                    {new Date(log.createdAt).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
