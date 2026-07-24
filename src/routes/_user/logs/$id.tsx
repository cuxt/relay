import { useMemo, useState, type MouseEvent } from 'react'
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
import { ImageLightbox } from '@/components/shared/image-lightbox'
import { CopyButton } from '@/components/shared/copy-button'
import { cn } from '@/lib/utils'
import {
  Clock,
  Gauge,
  Server,
  AlertTriangle,
  MonitorSmartphone,
  Eye,
  Code,
  Braces,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from 'lucide-react'
import { buildLogsSearch, normalizeLogsSearch } from './-search'

export const Route = createFileRoute('/_user/logs/$id')({
  validateSearch: normalizeLogsSearch,
  component: LogDetailPage,
})

const md = createMarkdownExit()

function formatRequestBody(value: string | null | undefined) {
  if (!value) return ''

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

function LogDetailPage() {
  const { id } = Route.useParams()
  const logsSearch = buildLogsSearch(Route.useSearch())
  const { data: log, isLoading } = usePushLogDetail(id)
  const [renderMarkdown, setRenderMarkdown] = useState(true)
  const [formatRequest, setFormatRequest] = useState(true)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const backTo = { to: '/logs', search: logsSearch }

  const renderedHtml = useMemo(
    () => (log?.resolvedMessage ? md.render(log.resolvedMessage) : ''),
    [log?.resolvedMessage]
  )
  const requestBody = log?.requestBody ?? ''
  const formattedRequestBody = useMemo(() => formatRequestBody(requestBody), [requestBody])

  const handleMarkdownClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    if (!target) return
    const img = target.closest('img')
    if (!img) return
    const src = img.getAttribute('src')
    if (!src) return
    event.preventDefault()
    setLightbox({ src, alt: img.getAttribute('alt') ?? '' })
  }

  if (isLoading) {
    return (
      <PageContainer title="日志详情" backTo={backTo} backLabel="返回日志">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  if (!log) {
    return (
      <PageContainer title="日志详情" backTo={backTo} backLabel="返回日志">
        <Card className="gap-0 py-0">
          <CardContent className="py-12 text-center text-muted-foreground">
            日志不存在或已被删除
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const statusLabel =
    log.status === 'success' ? '成功' : log.status === 'failed' ? '失败' : '处理中'

  const statusVariant =
    log.status === 'success'
      ? 'default'
      : log.status === 'failed'
        ? 'destructive'
        : ('secondary' as const)

  return (
    <PageContainer
      title="日志详情"
      description="查看本次推送的执行结果、消息内容与原始请求"
      backTo={backTo}
      backLabel="返回日志"
    >
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0}>
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-lg',
                      log.status === 'success' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      log.status === 'failed' && 'bg-destructive/10 text-destructive',
                      log.status === 'pending' &&
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {log.status === 'success' ? (
                      <CheckCircle2 className="size-5" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="size-5" />
                    ) : (
                      <LoaderCircle className="size-5 animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">消息投递{statusLabel}</h2>
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {log.endpointName || '未知端点'} · {log.channelName || '未知渠道'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {log.latencyMs != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      <Gauge className="size-3.5" />
                      {log.latencyMs}ms
                    </span>
                  )}
                  {log.responseStatus && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      <Server className="size-3.5" />
                      HTTP {log.responseStatus}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>

            <div className="grid grid-cols-1 divide-y border-t bg-muted/20 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <div className="min-w-0 px-5 py-4">
                <span className="text-xs font-medium text-muted-foreground">端点</span>
                <span className="mt-1 block truncate text-sm font-medium">
                  {log.endpointName || '-'}
                </span>
              </div>

              <div className="min-w-0 px-5 py-4">
                <span className="text-xs font-medium text-muted-foreground">渠道</span>
                <div className="mt-1 min-w-0">
                  <div className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium">
                    {log.channelType && (
                      <ChannelIcon type={log.channelType as ChannelType} size="sm" />
                    )}
                    <span className="truncate">{log.channelName || '-'}</span>
                  </div>
                  {log.channelType && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {CHANNEL_TYPES[log.channelType as ChannelType]?.label}
                    </p>
                  )}
                </div>
              </div>

              <div className="min-w-0 px-5 py-4">
                <span className="text-xs font-medium text-muted-foreground">来源 IP</span>
                <span className="mt-1 block truncate font-mono text-xs">
                  {log.requestIp || '-'}
                </span>
              </div>

              <div className="min-w-0 px-5 py-4">
                <span className="text-xs font-medium text-muted-foreground">记录时间</span>
                <span className="mt-1 block text-xs">
                  {new Date(log.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 错误信息 */}
        {log.errorMessage && (
          <motion.div variants={fadeUp} custom={1}>
            <Card className="gap-0 border-destructive/30 py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="size-4" />
                  错误信息
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <pre className="max-h-72 overflow-auto rounded-lg border border-destructive/15 bg-destructive/5 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-destructive">
                  {log.errorMessage}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 发送消息（markdown 渲染 / 原文切换） */}
        {log.resolvedMessage && (
          <motion.div variants={fadeUp} custom={log.errorMessage ? 2 : 1}>
            <Card className="gap-0 py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-medium">发送消息</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">最终发送到渠道的消息内容</p>
                  </div>
                  <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => setRenderMarkdown(true)}
                      aria-pressed={renderMarkdown}
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
                      aria-pressed={!renderMarkdown}
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
              <CardContent className="px-5 pb-5">
                {renderMarkdown ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4 [&_img]:cursor-zoom-in [&_img]:rounded-md [&_img]:transition-opacity [&_img]:hover:opacity-90"
                    onClick={handleMarkdownClick}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {log.resolvedMessage}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 原始请求 */}
        <motion.div variants={fadeUp} custom={log.errorMessage ? 3 : 2}>
          <Card className="gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Braces className="size-4" />
                    原始请求
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    调用端点时记录的请求体和来源信息
                  </p>
                </div>
                {requestBody && (
                  <div className="flex items-center gap-1">
                    <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => setFormatRequest(true)}
                        aria-pressed={formatRequest}
                        className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                          formatRequest
                            ? 'bg-background text-foreground shadow-sm'
                            : 'hover:text-foreground'
                        }`}
                      >
                        格式化
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormatRequest(false)}
                        aria-pressed={!formatRequest}
                        className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
                          !formatRequest
                            ? 'bg-background text-foreground shadow-sm'
                            : 'hover:text-foreground'
                        }`}
                      >
                        原文
                      </button>
                    </div>
                    <CopyButton value={requestBody} className="size-7" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
                {requestBody
                  ? formatRequest
                    ? formattedRequestBody
                    : requestBody
                  : '未记录请求体'}
              </pre>

              <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/30 p-4 text-sm md:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">User Agent</p>
                  <p className="break-all font-mono text-xs leading-relaxed">
                    {log.requestUserAgent || '-'}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">请求来源</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <MonitorSmartphone className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-mono">{log.requestIp || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{new Date(log.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <ImageLightbox
        image={lightbox}
        onClose={() => {
          setLightbox(null)
        }}
      />
    </PageContainer>
  )
}
