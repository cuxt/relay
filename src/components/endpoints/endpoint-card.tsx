import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2, MoreVertical, Send, Code2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { TokenDisplay } from './token-display'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

interface EndpointCardProps {
  endpoint: {
    id: string
    name: string
    token: string
    enabled: boolean
    channelId: string
    channelName: string
    channelType: ChannelType
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
  index
}: EndpointCardProps) {
  const channelMeta = CHANNEL_TYPES[endpoint.channelType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group transition-shadow hover:shadow-md h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ChannelIcon
                type={endpoint.channelType}
                size="lg"
                showBackground
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {endpoint.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs font-normal shrink-0"
                  >
                    {channelMeta?.label || endpoint.channelType}
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">
                    {endpoint.channelName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Switch
                checked={endpoint.enabled}
                onCheckedChange={checked => onToggle(endpoint.id, checked)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTestPush(endpoint)}>
                    <Send className="mr-2 h-4 w-4" />
                    测试推送
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShowExample(endpoint)}>
                    <Code2 className="mr-2 h-4 w-4" />
                    API 示例
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/endpoints/$id/edit" params={{ id: endpoint.id }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(endpoint.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1.5 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onTestPush(endpoint)}
            >
              <Send className="mr-1.5 h-3 w-3" />
              测试
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onShowExample(endpoint)}
            >
              <Code2 className="mr-1.5 h-3 w-3" />
              API
            </Button>
          </div>

          {/* Token 显示 */}
          <div className="mt-auto pt-4">
            <TokenDisplay
              token={endpoint.token}
              onRegenerate={() => onRegenerateToken(endpoint.id)}
              regenerating={regenerating}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
