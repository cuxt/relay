import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2, Calendar, Settings2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface ChannelCardProps {
  channel: {
    id: string
    name: string
    type: ChannelType
    enabled: boolean
    createdAt: string
    config: Record<string, unknown>
  }
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
  index: number
}

function getConfigPreview(_type: ChannelType, config: Record<string, unknown>): string | null {
  const webhook = config.webhook as string | undefined
  const botToken = config.botToken as string | undefined
  const corpId = config.corpId as string | undefined
  const server = config.server as string | undefined
  const smtp = config.smtp as Record<string, unknown> | undefined

  if (webhook) {
    try {
      return new URL(webhook).hostname
    } catch {
      return webhook.slice(0, 30)
    }
  }
  if (botToken) return `Bot ${botToken.slice(0, 8)}...`
  if (corpId) return `Corp: ${corpId}`
  if (smtp?.host) return smtp.host as string
  if (server) {
    try {
      return new URL(server).hostname
    } catch {
      return server.slice(0, 30)
    }
  }
  return null
}

export function ChannelCard({
  channel,
  onToggle,
  onDelete,
  index,
}: ChannelCardProps) {
  const meta = CHANNEL_TYPES[channel.type]
  const configPreview = getConfigPreview(channel.type, channel.config)
  const createdDate = new Date(channel.createdAt).toLocaleDateString('zh-CN')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <ChannelIcon type={channel.type} size="lg" showBackground />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">{channel.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs font-normal">
                  {meta?.label || channel.type}
                </Badge>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5">
              <span className="text-xs text-muted-foreground">
                {channel.enabled ? '已启用' : '已停用'}
              </span>
              <Switch
                aria-label={channel.enabled ? '停用渠道' : '启用渠道'}
                checked={channel.enabled}
                onCheckedChange={(checked) => onToggle(channel.id, checked)}
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-muted/40 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings2 className="size-3.5" />
              连接信息
            </div>
            {configPreview ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                      <p className="cursor-default truncate font-mono text-sm" />
                  }
                >
                  {configPreview}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-mono text-xs break-all">{configPreview}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            ) : (
              <p className="text-sm text-muted-foreground">已完成渠道配置</p>
            )}
          </div>
        </CardContent>

        <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            {createdDate}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              nativeButton={false}
              render={<Link to="/channels/$id/edit" params={{ id: channel.id }} />}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              <Pencil className="mr-1.5 size-3" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(channel.id)}
            >
              <Trash2 className="mr-1.5 size-3" />
              删除
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
