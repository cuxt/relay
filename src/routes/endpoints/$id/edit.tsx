import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { EndpointForm } from '@/components/endpoints/endpoint-form'
import { useEndpointDetail } from '@/hooks/use-endpoints'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/endpoints/$id/edit')({
  component: EditEndpointPage
})

function EditEndpointPage() {
  const { id } = Route.useParams()
  const { data: endpoint, isLoading } = useEndpointDetail(id)

  if (isLoading) {
    return (
      <PageContainer
        title="编辑端点"
        width="medium"
        backTo="/endpoints"
        backLabel="返回端点列表"
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (!endpoint) {
    return (
      <PageContainer
        title="端点不存在"
        width="medium"
        backTo="/endpoints"
        backLabel="返回端点列表"
      >
        <p className="text-muted-foreground">找不到该端点</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="编辑端点"
      description={`编辑端点：${endpoint.name}`}
      width="medium"
      backTo="/endpoints"
      backLabel="返回端点列表"
    >
      <EndpointForm mode="edit" defaultValues={endpoint} />
    </PageContainer>
  )
}
