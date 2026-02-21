import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock } from 'lucide-react'
import { usePushLogs } from '@/hooks/use-push-logs'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

export function RecentLogs() {
  const { data, isLoading } = usePushLogs({ limit: 5 })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">最近推送</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/logs">
              查看全部
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : !data?.items?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">暂无推送记录</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((log: any) => {
              const isSuccess = log.status === 'success'
              return (
                <Link
                  key={log.id}
                  to="/logs/$id"
                  params={{ id: log.id }}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {log.endpointName || '未知端点'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CHANNEL_TYPES[log.channelType as ChannelType]?.label ||
                          log.channelType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 ml-4">
                    {log.latencyMs != null && (
                      <span className="tabular-nums">{log.latencyMs}ms</span>
                    )}
                    <span className="tabular-nums">
                      {new Date(log.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
