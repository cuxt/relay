import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2, Send, Code2, Waypoints } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { TokenDisplay } from './token-display'
import type { ChannelType } from '@/lib/channels/constants'

interface EndpointCardProps {
  endpoint: {
    id: string
    name: string
    token: string
    enabled: boolean
    channels: Array<{
      id: string
      name: string
      type: ChannelType
      enabled: boolean
    }>
    createdAt: string
  }
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
  onTestPush: (endpoint: any) => void
  onShowExample: (endpoint: any) => void
  onRegenerateToken: (id: string) => void
  regenerating: boolean
  index: number
}

export function EndpointCard({
  endpoint,
  onToggle,
  onDelete,
  onTestPush,
  onShowExample,
  onRegenerateToken,
  regenerating,
  index,
}: EndpointCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{endpoint.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Webhook 推送端点</p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5">
              <span className="text-xs text-muted-foreground">
                {endpoint.enabled ? '已启用' : '已停用'}
              </span>
              <Switch
                aria-label={endpoint.enabled ? '停用端点' : '启用端点'}
                checked={endpoint.enabled}
                onCheckedChange={(checked) => onToggle(endpoint.id, checked)}
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground">关联渠道</span>
              <Badge variant="outline" className="shrink-0 bg-background text-xs font-normal">
                {endpoint.channels.length} 个
              </Badge>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              {endpoint.channels.length > 0 ? (
                <div className="flex shrink-0 -space-x-2">
                  {endpoint.channels.slice(0, 3).map((channel) => (
                    <ChannelIcon
                      key={channel.id}
                      type={channel.type}
                      size="sm"
                      showBackground
                      className="ring-2 ring-card"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                  <Waypoints className="size-4" />
                </div>
              )}
              <span className="truncate text-sm">
                {endpoint.channels.map((channel) => channel.name).join('、') || '暂未绑定渠道'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">推送地址</p>
            <TokenDisplay
              token={endpoint.token}
              onRegenerate={() => onRegenerateToken(endpoint.id)}
              regenerating={regenerating}
              className="bg-muted/30"
            />
          </div>
        </CardContent>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onTestPush(endpoint)}
            >
              <Send className="mr-1.5 h-3 w-3" />
              测试
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onShowExample(endpoint)}
            >
              <Code2 className="mr-1.5 h-3 w-3" />
              API
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              nativeButton={false}
              render={<Link to="/endpoints/$id/edit" params={{ id: endpoint.id }} />}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              <Pencil className="mr-1.5 h-3 w-3" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(endpoint.id)}
            >
              <Trash2 className="mr-1.5 h-3 w-3" />
              删除
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
