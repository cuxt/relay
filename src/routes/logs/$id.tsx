import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createMarkdownExit } from 'markdown-exit'
import { motion } from 'framer-motion'
import { PageContainer } from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePushLogDetail } from '@/hooks/use-push-logs'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { cn } from '@/lib/utils'
import {
  Clock,
  Gauge,
  Server,
  AlertTriangle,
  MonitorSmartphone,
  Eye,
  Code,
  Bot
} from 'lucide-react'
import { buildLogsSearch, normalizeLogsSearch } from './-search'

export const Route = createFileRoute('/logs/$id')({
  validateSearch: normalizeLogsSearch,
  component: LogDetailPage
})

const md = createMarkdownExit()

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const }
  })
}

function LogDetailPage() {
  const { id } = Route.useParams()
  const logsSearch = buildLogsSearch(Route.useSearch())
  const { data: log, isLoading } = usePushLogDetail(id)
  const [renderMarkdown, setRenderMarkdown] = useState(true)
  const backTo = { to: '/logs', search: logsSearch }

  if (isLoading) {
    return (
      <PageContainer title="推送详情" backTo={backTo} backLabel="返回日志">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (!log) {
    return (
      <PageContainer title="推送详情" backTo={backTo} backLabel="返回日志">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            日志不存在或已被删除
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const statusLabel =
    log.status === 'success'
      ? '成功'
      : log.status === 'failed'
        ? '失败'
        : '处理中'

  const statusVariant =
    log.status === 'success'
      ? 'default'
      : log.status === 'failed'
        ? 'destructive'
        : ('secondary' as const)

  return (
    <PageContainer title="推送详情" backTo={backTo} backLabel="返回日志">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        {/* 概览信息 */}
        <motion.div variants={fadeUp} custom={0}>
          <Card className={cn(
              'py-0 border-l-2',
              log.status === 'success' && 'border-l-emerald-500 dark:border-l-emerald-400',
              log.status === 'failed' && 'border-l-red-500 dark:border-l-red-400',
              log.status === 'pending' && 'border-l-amber-500 dark:border-l-amber-400'
            )}>
            <CardContent className="p-0">
              {/* Status + metrics */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5 sm:py-4">
                <Badge variant={statusVariant} className="text-sm px-3 py-1">
                  {statusLabel}
                </Badge>
                {log.latencyMs != null && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                    <Gauge className="h-3 w-3" />
                    {log.latencyMs}ms
                  </span>
                )}
                {log.responseStatus && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                    <Server className="h-3 w-3" />
                    HTTP {log.responseStatus}
                  </span>
                )}
              </div>

              {/* Detail info: horizontal KV rows on mobile, grid on desktop */}
              <div className="border-t divide-y sm:divide-y-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-4 sm:px-5 sm:py-4 text-sm">
                <div className="flex items-center justify-between px-4 py-2.5 sm:p-0 sm:block min-w-0">
                  <span className="text-muted-foreground shrink-0">端点</span>
                  <span className="font-medium truncate ml-4 sm:ml-0 sm:mt-1 sm:block">
                    {log.endpointName || '-'}
                  </span>
                </div>

                <div className="flex items-start justify-between px-4 py-2.5 sm:p-0 sm:block min-w-0">
                  <span className="text-muted-foreground shrink-0 leading-6">渠道</span>
                  <div className="ml-4 sm:ml-0 sm:mt-1 min-w-0">
                    <div className="font-medium inline-flex items-center gap-1.5">
                      {log.channelType && (
                        <ChannelIcon
                          type={log.channelType as ChannelType}
                          size="sm"
                        />
                      )}
                      <span className="truncate">{log.channelName || '-'}</span>
                    </div>
                    {log.channelType && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CHANNEL_TYPES[log.channelType as ChannelType]?.label}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 sm:p-0 sm:block min-w-0">
                  <span className="text-muted-foreground shrink-0">来源 IP</span>
                  <span className="font-mono text-xs ml-4 sm:ml-0 sm:mt-1 sm:block">
                    {log.requestIp || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 sm:p-0 sm:block min-w-0">
                  <span className="text-muted-foreground shrink-0">时间</span>
                  <span className="text-xs ml-4 sm:ml-0 sm:mt-1 sm:block">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 错误信息 */}
        {log.errorMessage && (
          <motion.div variants={fadeUp} custom={1}>
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  错误信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-destructive/5 p-3 text-xs font-mono whitespace-pre-wrap text-destructive">
                  {log.errorMessage}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 发送消息（markdown 渲染 / 原文切换） */}
        {log.resolvedMessage && (
          <motion.div variants={fadeUp} custom={log.errorMessage ? 2 : 1}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    发送消息
                  </CardTitle>
                  <div className="inline-flex items-center rounded-md bg-muted p-0.5 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setRenderMarkdown(true)}
                      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                        renderMarkdown
                          ? 'bg-background text-foreground shadow-sm'
                          : 'hover:text-foreground'
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      渲染
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenderMarkdown(false)}
                      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                        !renderMarkdown
                          ? 'bg-background text-foreground shadow-sm'
                          : 'hover:text-foreground'
                      }`}
                    >
                      <Code className="h-3 w-3" />
                      原文
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderMarkdown ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-muted/50 p-4"
                    dangerouslySetInnerHTML={{
                      __html: md.render(log.resolvedMessage)
                    }}
                  />
                ) : (
                  <pre className="rounded-md bg-muted/50 p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {log.resolvedMessage}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 请求信息 */}
        <motion.div variants={fadeUp} custom={log.errorMessage ? 3 : 2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4" />
                请求信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">User Agent</p>
                  <p className="font-mono text-xs break-all">{log.userAgent || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">来源</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(log.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{log.triggerType || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
