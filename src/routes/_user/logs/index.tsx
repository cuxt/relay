import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, FileText, Gauge, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { EmptyState } from '@/components/shared/empty-state'
import { useEndpointList } from '@/hooks/use-endpoints'
import { usePushLogs } from '@/hooks/use-push-logs'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import { cn } from '@/lib/utils'
import { buildLogsSearch, normalizeLogsSearch, type LogsSearchInput } from './-search'

export const Route = createFileRoute('/_user/logs/')({
  validateSearch: normalizeLogsSearch,
  component: LogsPage,
})

const STATUS_META: Record<string, { label: string; dotClassName: string; textClassName: string }> =
  {
    success: {
      label: '成功',
      dotClassName: 'bg-emerald-500',
      textClassName: 'text-emerald-700 dark:text-emerald-400',
    },
    failed: {
      label: '失败',
      dotClassName: 'bg-destructive',
      textClassName: 'text-destructive',
    },
    pending: {
      label: '处理中',
      dotClassName: 'bg-amber-500',
      textClassName: 'text-amber-700 dark:text-amber-400',
    },
  }

const STATUS_LABELS: Record<string, string> = {
  all: '所有状态',
  success: '成功',
  failed: '失败',
  pending: '处理中',
}

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.pending
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function LogsPage() {
  const navigate = useNavigate()
  const currentSearch = Route.useSearch()
  const filters = normalizeLogsSearch(currentSearch)
  const { page, status, search, endpointId, channelType } = filters
  const [searchInput, setSearchInput] = useState(search ?? '')

  const { data: endpointsList } = useEndpointList()
  const { data, isLoading } = usePushLogs({
    page,
    limit: 20,
    status,
    search,
    endpointId,
    channelType,
  })

  const selectedEndpoint = endpointsList?.find((endpoint: any) => endpoint.id === endpointId)
  const hasFilters = Boolean(status || search || endpointId || channelType)

  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  const updateFilters = (partial: Omit<LogsSearchInput, 'page'>) => {
    navigate({
      to: '/logs',
      search: buildLogsSearch({
        ...filters,
        ...partial,
        page: 1,
      }),
      replace: true,
    })
  }

  const updatePage = (nextPage: number) => {
    navigate({
      to: '/logs',
      search: buildLogsSearch({
        ...filters,
        page: nextPage,
      }),
    })
  }

  const openLog = (id: string) => {
    navigate({
      to: '/logs/$id',
      params: { id },
      search: buildLogsSearch(filters),
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    navigate({
      to: '/logs',
      search: buildLogsSearch({ page: 1 }),
      replace: true,
    })
  }

  useEffect(() => {
    const trimmedInput = searchInput.trim()
    const trimmedSearch = search ?? ''
    if (trimmedInput === trimmedSearch) return

    const timer = window.setTimeout(() => {
      updateFilters({ search: trimmedInput || undefined })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput, search])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">运行记录</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">推送日志</h1>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
            查看每次推送的执行状态、目标渠道、消息内容和响应耗时。
          </p>
        </div>
        {data?.total != null && (
          <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
            共 {data.total} 条记录
          </p>
        )}
      </header>

      <section aria-label="日志筛选" className="space-y-3 py-1">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="搜索消息内容"
            placeholder="搜索消息内容"
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[9rem_minmax(10rem,1fr)_11rem_auto]">
          <Select
            value={status ?? 'all'}
            onValueChange={(value) =>
              updateFilters({ status: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger aria-label="筛选状态" className="w-full">
              <SelectValue>{STATUS_LABELS[status ?? 'all']}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="pending">处理中</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={endpointId ?? 'all'}
            onValueChange={(value) =>
              updateFilters({ endpointId: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger aria-label="筛选端点" className="w-full">
              <SelectValue>{selectedEndpoint?.name ?? '所有端点'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有端点</SelectItem>
              {endpointsList?.map((endpoint: any) => (
                <SelectItem key={endpoint.id} value={endpoint.id}>
                  {endpoint.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={channelType ?? 'all'}
            onValueChange={(value) =>
              updateFilters({ channelType: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger aria-label="筛选渠道" className="w-full">
              <SelectValue>
                {channelType ? (
                  <span className="inline-flex h-5 items-center gap-2 leading-none">
                    <ChannelIcon type={channelType as ChannelType} size="sm" />
                    <span className="leading-5">
                      {CHANNEL_TYPES[channelType as ChannelType]?.label}
                    </span>
                  </span>
                ) : (
                  '所有渠道'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有渠道</SelectItem>
              {Object.entries(CHANNEL_TYPES).map(([value, meta]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex h-5 items-center gap-2 leading-none">
                    <ChannelIcon type={value as ChannelType} size="sm" className="shrink-0" />
                    <span className="leading-5">{meta.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            className="justify-start px-2 lg:justify-center"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <RotateCcw className="size-4" />
            重置筛选
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.items?.length ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title={hasFilters ? '没有匹配的日志' : '暂无推送日志'}
          description={
            hasFilters ? '尝试调整或重置筛选条件' : '产生推送请求后，执行记录会显示在这里'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                重置筛选
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden border-y border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="min-w-44">端点与渠道</TableHead>
                  <TableHead className="min-w-64">消息内容</TableHead>
                  <TableHead className="w-24 text-right">耗时</TableHead>
                  <TableHead className="w-40 text-right">时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log: any) => {
                  const statusMeta = getStatusMeta(log.status)
                  return (
                    <TableRow
                      key={log.id}
                      role="link"
                      tabIndex={0}
                      className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none"
                      onClick={() => openLog(log.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openLog(log.id)
                        }
                      }}
                    >
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 text-sm font-medium',
                            statusMeta.textClassName
                          )}
                        >
                          <span className={cn('size-2 rounded-full', statusMeta.dotClassName)} />
                          {statusMeta.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{log.endpointName || '未知端点'}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {log.channelType && (
                            <ChannelIcon type={log.channelType as ChannelType} size="sm" />
                          )}
                          <span>
                            {CHANNEL_TYPES[log.channelType as ChannelType]?.label || '未知渠道'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal">
                        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                          {log.resolvedMessage || '未生成消息内容'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {log.latencyMs != null ? `${log.latencyMs} ms` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y divide-border border-y border-border md:hidden">
            {data.items.map((log: any) => {
              const statusMeta = getStatusMeta(log.status)
              return (
                <button
                  key={log.id}
                  type="button"
                  className="block w-full px-1 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                  onClick={() => openLog(log.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{log.endpointName || '未知端点'}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {log.channelType && (
                          <ChannelIcon type={log.channelType as ChannelType} size="sm" />
                        )}
                        <span>
                          {CHANNEL_TYPES[log.channelType as ChannelType]?.label || '未知渠道'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-2 text-sm font-medium',
                        statusMeta.textClassName
                      )}
                    >
                      <span className={cn('size-2 rounded-full', statusMeta.dotClassName)} />
                      {statusMeta.label}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {log.resolvedMessage || '未生成消息内容'}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-4 text-xs tabular-nums text-muted-foreground">
                    <span>{formatDate(log.createdAt)}</span>
                    {log.latencyMs != null && (
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="size-3.5" />
                        {log.latencyMs} ms
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm tabular-nums text-muted-foreground">
                第 {data.page} / {data.totalPages} 页
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                >
                  下一页
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
