import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2, MoreVertical, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
    webhookUrl?: string | null
    botToken?: string | null
    corpId?: string | null
    smtpHost?: string | null
    barkServerUrl?: string | null
  }
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
  index: number
}

function getConfigPreview(channel: ChannelCardProps['channel']): string | null {
  if (channel.webhookUrl) {
    try {
      const url = new URL(channel.webhookUrl)
      return url.hostname
    } catch {
      return channel.webhookUrl.slice(0, 30)
    }
  }
  if (channel.botToken) return `Bot ${channel.botToken.slice(0, 8)}...`
  if (channel.corpId) return `Corp: ${channel.corpId}`
  if (channel.smtpHost) return channel.smtpHost
  if (channel.barkServerUrl) {
    try {
      return new URL(channel.barkServerUrl).hostname
    } catch {
      return channel.barkServerUrl.slice(0, 30)
    }
  }
  return null
}

export function ChannelCard({
  channel,
  onToggle,
  onDelete,
  index
}: ChannelCardProps) {
  const meta = CHANNEL_TYPES[channel.type]
  const configPreview = getConfigPreview(channel)
  const createdDate = new Date(channel.createdAt).toLocaleDateString('zh-CN')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300 } }}
    >
      <Card className="relative transition-shadow hover:shadow-md h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header: icon + name + actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ChannelIcon type={channel.type} size="lg" showBackground />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {channel.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {meta?.label || channel.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Switch
                checked={channel.enabled}
                onCheckedChange={checked => onToggle(channel.id, checked)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    />
                  }
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={
                      <Link to="/channels/$id/edit" params={{ id: channel.id }} />
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(channel.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Config preview */}
          {configPreview && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <p className="text-xs font-mono text-muted-foreground mt-3 truncate cursor-default" />
                  }
                >
                  {configPreview}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-mono text-xs break-all">{configPreview}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Footer: status + date */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t">
            <Badge
              variant={channel.enabled ? 'default' : 'secondary'}
              className="text-xs"
            >
              {channel.enabled ? '已启用' : '已禁用'}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {createdDate}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
