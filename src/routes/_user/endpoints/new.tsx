import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { EndpointForm } from '@/components/endpoints/endpoint-form'

export const Route = createFileRoute('/_user/endpoints/new')({
  component: NewEndpointPage
})

function NewEndpointPage() {
  return (
    <PageContainer
      title="新建端点"
      description="配置推送端点和消息模板"
      width="medium"
      backTo="/endpoints"
      backLabel="返回端点列表"
    >
      <EndpointForm mode="create" />
    </PageContainer>
  )
}
