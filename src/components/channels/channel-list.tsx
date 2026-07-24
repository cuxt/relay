import { Radio } from 'lucide-react'
import { ChannelCard } from './channel-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import type { ChannelType } from '@/lib/channels/constants'

interface Channel {
  id: string
  name: string
  type: ChannelType
  enabled: boolean
  createdAt: string
  config: Record<string, unknown>
}

interface ChannelListProps {
  channels: Channel[] | undefined
  isLoading: boolean
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
}

export function ChannelList({
  channels,
  isLoading,
  onToggle,
  onDelete,
}: ChannelListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!channels?.length) {
    return (
      <EmptyState
        icon={<Radio className="h-6 w-6" />}
        title="暂无渠道"
        description="创建一个通知渠道，将消息转发到飞书、企微等平台"
        action={
          <Button nativeButton={false} render={<Link to="/channels/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            创建渠道
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onToggle={onToggle}
          onDelete={onDelete}
          index={index}
        />
      ))}
    </div>
  )
}
