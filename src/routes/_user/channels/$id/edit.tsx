import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ChannelForm } from '@/components/channels/channel-form'
import { useChannelDetail } from '@/hooks/use-channels'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_user/channels/$id/edit')({
  component: EditChannelPage
})

function EditChannelPage() {
  const { id } = Route.useParams()
  const { data: channel, isLoading } = useChannelDetail(id)

  if (isLoading) {
    return (
      <PageContainer
        title="编辑渠道"
        width="medium"
        backTo="/channels"
        backLabel="返回渠道列表"
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (!channel) {
    return (
      <PageContainer
        title="渠道不存在"
        width="medium"
        backTo="/channels"
        backLabel="返回渠道列表"
      >
        <p className="text-muted-foreground">找不到该渠道</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="编辑渠道"
      description={`编辑渠道：${channel.name}`}
      width="medium"
      backTo="/channels"
      backLabel="返回渠道列表"
    >
      <ChannelForm mode="edit" defaultValues={channel} />
    </PageContainer>
  )
}
