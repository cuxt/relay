import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import { EndpointList } from '@/components/endpoints/endpoint-list'
import { TestPushDialog } from '@/components/endpoints/test-push-dialog'
import { ApiExampleDialog } from '@/components/endpoints/api-example-dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  useEndpointList,
  useUpdateEndpoint,
  useDeleteEndpoint,
  useRegenerateToken
} from '@/hooks/use-endpoints'

export const Route = createFileRoute('/endpoints/')({
  component: EndpointsPage
})

function EndpointsPage() {
  const { data: endpoints, isLoading } = useEndpointList()
  const updateEndpoint = useUpdateEndpoint()
  const deleteEndpoint = useDeleteEndpoint()
  const regenerateToken = useRegenerateToken()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [regenerateId, setRegenerateId] = useState<string | null>(null)
  const [testEndpoint, setTestEndpoint] = useState<any>(null)
  const [exampleEndpoint, setExampleEndpoint] = useState<any>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateEndpoint.mutateAsync({ id, data: { enabled } })
      toast.success(enabled ? '端点已启用' : '端点已禁用')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteEndpoint.mutateAsync(deleteId)
      toast.success('端点已删除')
      setDeleteId(null)
    } catch {
      toast.error('删除失败')
    }
  }

  const handleRegenerate = async () => {
    if (!regenerateId) return
    setRegeneratingId(regenerateId)
    try {
      await regenerateToken.mutateAsync(regenerateId)
      toast.success('Token 已重新生成')
      setRegenerateId(null)
    } catch {
      toast.error('重新生成失败')
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <PageContainer
      title="端点管理"
      description="管理推送端点，每个端点有唯一的 Webhook URL"
      action={
        <Button asChild>
          <Link to="/endpoints/new">
            <Plus className="mr-2 h-4 w-4" />
            新建端点
          </Link>
        </Button>
      }
    >
      <EndpointList
        endpoints={endpoints}
        isLoading={isLoading}
        onToggle={handleToggle}
        onDelete={setDeleteId}
        onTestPush={setTestEndpoint}
        onShowExample={setExampleEndpoint}
        onRegenerateToken={setRegenerateId}
        regeneratingId={regeneratingId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="删除端点"
        description="确定要删除该端点吗？相关的推送日志也会被删除，此操作不可撤销。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteEndpoint.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!regenerateId}
        onOpenChange={open => !open && setRegenerateId(null)}
        title="重新生成 Token"
        description="重新生成后，原有的推送地址将立即失效，所有使用旧地址的服务需要更新。确定继续？"
        confirmLabel="重新生成"
        variant="destructive"
        loading={regenerateToken.isPending}
        onConfirm={handleRegenerate}
      />

      <TestPushDialog
        open={!!testEndpoint}
        onOpenChange={open => !open && setTestEndpoint(null)}
        endpoint={testEndpoint}
      />

      <ApiExampleDialog
        open={!!exampleEndpoint}
        onOpenChange={open => !open && setExampleEndpoint(null)}
        endpoint={exampleEndpoint}
      />
    </PageContainer>
  )
}
