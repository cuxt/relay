import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { ChannelForm } from '@/components/channels/channel-form'

export const Route = createFileRoute('/_user/channels/new')({
  component: NewChannelPage
})

function NewChannelPage() {
  return (
    <PageContainer
      title="新建渠道"
      description="选择渠道类型并填写配置信息"
      width="medium"
      backTo="/channels"
      backLabel="返回渠道列表"
    >
      <ChannelForm mode="create" />
    </PageContainer>
  )
}
