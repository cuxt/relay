import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { usePushLogs } from '@/hooks/use-push-logs'
import { useEndpointList } from '@/hooks/use-endpoints'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export const Route = createFileRoute('/logs/')({
  component: LogsPage
})

function LogsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [endpointId, setEndpointId] = useState<string>('')
  const [channelType, setChannelType] = useState<string>('')

  const { data: endpointsList } = useEndpointList()

  const { data, isLoading } = usePushLogs({
    page,
    limit: 20,
    status: status || undefined,
    search: search || undefined,
    endpointId: endpointId || undefined,
    channelType: channelType || undefined
  })

  return (
    <PageContainer title="推送日志" description="查看所有推送记录和详细信息">
      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-50 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索消息内容..."
                className="pl-9"
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={v => {
                setStatus(!v || v === 'all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-30">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="pending">处理中</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={endpointId}
              onValueChange={v => {
                setEndpointId(!v || v === 'all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="端点">
                  {(value: string | null) => {
                    if (!value || value === 'all') return '所有端点'
                    const ep = endpointsList?.find((e: any) => e.id === value)
                    return ep?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有端点</SelectItem>
                {endpointsList?.map((ep: any) => (
                  <SelectItem key={ep.id} value={ep.id}>
                    {ep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={channelType}
              onValueChange={v => {
                setChannelType(!v || v === 'all' ? '' : v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="渠道" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有渠道</SelectItem>
                {Object.entries(CHANNEL_TYPES).map(([value, meta]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <ChannelIcon type={value as ChannelType} size="sm" />
                      {meta.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data?.total != null && (
              <span className="text-sm text-muted-foreground ml-auto">
                共 {data.total} 条记录
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data?.items?.length ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="暂无推送日志"
          description="当有推送请求时，日志会自动记录在这里"
        />
      ) : (
        <>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead>端点</TableHead>
                  <TableHead className="min-w-50">消息内容</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead className="w-45">时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log: any) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate({ to: '/logs/$id', params: { id: log.id } })
                    }
                  >
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'success'
                            ? 'default'
                            : log.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {log.status === 'success'
                          ? '成功'
                          : log.status === 'failed'
                            ? '失败'
                            : '处理中'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.endpointName || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-75">
                      <span className="line-clamp-1">
                        {log.resolvedMessage || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {CHANNEL_TYPES[log.channelType as ChannelType]?.label ||
                        '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                第 {data.page}/{data.totalPages} 页
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                >
                  下一页
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
