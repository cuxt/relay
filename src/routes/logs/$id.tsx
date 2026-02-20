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

export const Route = createFileRoute('/logs/$id')({
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
  const { data: log, isLoading } = usePushLogDetail(id)
  const [renderMarkdown, setRenderMarkdown] = useState(true)

  if (isLoading) {
    return (
      <PageContainer title="推送详情" backTo="/logs" backLabel="返回日志">
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
      <PageContainer title="推送详情" backTo="/logs" backLabel="返回日志">
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
    <PageContainer title="推送详情" backTo="/logs" backLabel="返回日志">
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 概览信息 */}
        <motion.div variants={fadeUp} custom={0}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={statusVariant} className="text-sm px-3 py-1">
                  {statusLabel}
                </Badge>
                {log.latencyMs != null && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    {log.latencyMs}ms
                  </div>
                )}
                {log.responseStatus && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Server className="h-3.5 w-3.5" />
                    HTTP {log.responseStatus}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5">端点</p>
                  <p className="font-medium">{log.endpointName || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">渠道</p>
                  <div className="flex items-center gap-1.5 font-medium">
                    {log.channelType && (
                      <ChannelIcon
                        type={log.channelType as ChannelType}
                        size="sm"
                      />
                    )}
                    {log.channelName || '-'}
                    {log.channelType && (
                      <span className="text-muted-foreground font-normal">
                        ({CHANNEL_TYPES[log.channelType as ChannelType]?.label})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">来源 IP</p>
                  <p className="font-mono text-xs">{log.requestIp || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">时间</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
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
                  <CardTitle className="text-sm font-medium">发送消息</CardTitle>
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
                  <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                    {log.resolvedMessage}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI 处理 */}
        {(log.aiProcessedMessage || log.aiError) && (
          <motion.div
            variants={fadeUp}
            custom={
              (log.errorMessage ? 2 : 1) + (log.resolvedMessage ? 1 : 0)
            }
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI 处理
                  </CardTitle>
                  {log.aiLatencyMs != null && (
                    <span className="text-xs text-muted-foreground">
                      总耗时 {log.aiLatencyMs}ms
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.aiError && (
                  <div>
                    <p className="text-xs text-destructive mb-1">错误摘要</p>
                    <pre className="rounded-md bg-destructive/5 p-3 text-xs font-mono whitespace-pre-wrap text-destructive">
                      {log.aiError}
                    </pre>
                  </div>
                )}
                {log.aiProcessedMessage && (
                  <AiCallChain raw={log.aiProcessedMessage} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 请求体 */}
        {log.requestBody && (
          <motion.div
            variants={fadeUp}
            custom={
              (log.errorMessage ? 2 : 1) +
              (log.resolvedMessage ? 1 : 0) +
              (log.aiProcessedMessage || log.aiError ? 1 : 0)
            }
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">请求体</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {tryFormatJson(log.requestBody)}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 响应体 */}
        {log.responseBody && (
          <motion.div
            variants={fadeUp}
            custom={
              (log.errorMessage ? 2 : 1) +
              (log.resolvedMessage ? 1 : 0) +
              (log.aiProcessedMessage || log.aiError ? 1 : 0) +
              (log.requestBody ? 1 : 0)
            }
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">响应体</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {tryFormatJson(log.responseBody)}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User-Agent */}
        {log.requestUserAgent && (
          <motion.div
            variants={fadeUp}
            custom={
              (log.errorMessage ? 2 : 1) +
              (log.resolvedMessage ? 1 : 0) +
              (log.aiProcessedMessage || log.aiError ? 1 : 0) +
              (log.requestBody ? 1 : 0) +
              (log.responseBody ? 1 : 0)
            }
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4" />
                  User-Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground break-all font-mono">
                  {log.requestUserAgent}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  )
}

function tryFormatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

interface AiCallMeta {
  presetKey: string
  input: string
  output: string
  latencyMs: number
  error: string | null
}

function AiCallChain({ raw }: { raw: string }) {
  let calls: AiCallMeta[]
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('Invalid format')
    calls = parsed
  } catch {
    return (
      <p className="text-xs text-destructive">AI 调用数据解析失败</p>
    )
  }

  if (calls.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">调用链</p>
      {calls.map((call, i) => (
        <div key={i} className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <code className="text-xs font-semibold">ai.{call.presetKey}()</code>
            <span className="text-xs text-muted-foreground">{call.latencyMs}ms</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">输入</p>
            <pre className="rounded bg-muted p-2 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {call.input}
            </pre>
          </div>
          {call.error ? (
            <div>
              <p className="text-xs text-destructive mb-0.5">错误</p>
              <pre className="rounded bg-destructive/10 p-2 text-xs font-mono whitespace-pre-wrap text-destructive">
                {call.error}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">输出</p>
              <pre className="rounded bg-muted p-2 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                {call.output}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
