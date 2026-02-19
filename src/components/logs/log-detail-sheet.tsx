import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { usePushLogDetail } from '@/hooks/use-push-logs'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

interface LogDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logId: string | null
}

export function LogDetailSheet({
  open,
  onOpenChange,
  logId
}: LogDetailSheetProps) {
  const { data: log, isLoading } = usePushLogDetail(logId || '')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>推送详情</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !log ? (
          <p className="text-muted-foreground mt-4">日志不存在</p>
        ) : (
          <div className="space-y-6 mt-4">
            {/* 基本信息 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant={log.status === 'success' ? 'default' : 'destructive'}
                >
                  {log.status === 'success'
                    ? '成功'
                    : log.status === 'failed'
                      ? '失败'
                      : '处理中'}
                </Badge>
                {log.latencyMs != null && (
                  <span className="text-sm text-muted-foreground">
                    {log.latencyMs}ms
                  </span>
                )}
                {log.responseStatus && (
                  <span className="text-sm text-muted-foreground">
                    HTTP {log.responseStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">端点</p>
                  <p className="font-medium">{log.endpointName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">渠道</p>
                  <p className="font-medium">
                    {log.channelName || '-'}
                    {log.channelType && (
                      <span className="text-muted-foreground ml-1">
                        ({CHANNEL_TYPES[log.channelType as ChannelType]?.label})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">来源 IP</p>
                  <p className="font-mono text-xs">{log.requestIp || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">时间</p>
                  <p className="text-xs">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 错误信息 */}
            {log.errorMessage && (
              <div>
                <p className="text-sm font-medium text-destructive mb-1">
                  错误信息
                </p>
                <pre className="rounded-md bg-destructive/10 p-3 text-xs font-mono whitespace-pre-wrap text-destructive">
                  {log.errorMessage}
                </pre>
              </div>
            )}

            {/* 解析后的消息 */}
            {log.resolvedMessage && (
              <div>
                <p className="text-sm font-medium mb-1">发送消息</p>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {log.resolvedMessage}
                </pre>
              </div>
            )}

            {/* 请求体 */}
            {log.requestBody && (
              <div>
                <p className="text-sm font-medium mb-1">请求体</p>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {tryFormatJson(log.requestBody)}
                </pre>
              </div>
            )}

            {/* 响应体 */}
            {log.responseBody && (
              <div>
                <p className="text-sm font-medium mb-1">响应体</p>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {tryFormatJson(log.responseBody)}
                </pre>
              </div>
            )}

            {/* User Agent */}
            {log.requestUserAgent && (
              <div>
                <p className="text-sm font-medium mb-1">User-Agent</p>
                <p className="text-xs text-muted-foreground break-all">
                  {log.requestUserAgent}
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function tryFormatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}
