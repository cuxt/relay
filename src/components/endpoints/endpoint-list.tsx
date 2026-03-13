import { Waypoints, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { EndpointCard } from './endpoint-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface EndpointListProps {
  endpoints: any[] | undefined
  isLoading: boolean
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
  onTestPush: (endpoint: any) => void
  onShowExample: (endpoint: any) => void
  onRegenerateToken: (id: string) => void
  regeneratingId: string | null
}

export function EndpointList({
  endpoints,
  isLoading,
  onToggle,
  onDelete,
  onTestPush,
  onShowExample,
  onRegenerateToken,
  regeneratingId
}: EndpointListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-45 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!endpoints?.length) {
    return (
      <EmptyState
        icon={<Waypoints className="h-6 w-6" />}
        title="暂无端点"
        description="创建一个推送端点，获取 Webhook URL 用于接收外部消息"
        action={
          <Button nativeButton={false} render={<Link to="/endpoints/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            创建端点
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {endpoints.map((ep, index) => (
        <EndpointCard
          key={ep.id}
          endpoint={ep}
          onToggle={onToggle}
          onDelete={onDelete}
          onTestPush={onTestPush}
          onShowExample={onShowExample}
          onRegenerateToken={onRegenerateToken}
          regenerating={regeneratingId === ep.id}
          index={index}
        />
      ))}
    </div>
  )
}
