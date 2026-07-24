import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import { ChannelList } from '@/components/channels/channel-list'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  useChannelList,
  useUpdateChannel,
  useDeleteChannel
} from '@/hooks/use-channels'

export const Route = createFileRoute('/_user/channels/')({
  component: ChannelsPage
})

function ChannelsPage() {
  const { data: channels, isLoading } = useChannelList()
  const updateChannel = useUpdateChannel()
  const deleteChannel = useDeleteChannel()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateChannel.mutateAsync({ id, data: { enabled } })
      toast.success(enabled ? '渠道已启用' : '渠道已禁用')
    } catch {
      toast.error('操作失败')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteChannel.mutateAsync(deleteId)
      toast.success('渠道已删除')
      setDeleteId(null)
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <PageContainer
      title="渠道管理"
      description="管理消息通知渠道，支持飞书、企微、钉钉等平台"
      action={
        <Button nativeButton={false} render={<Link to="/channels/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          新建渠道
        </Button>
      }
    >
      <ChannelList
        channels={channels}
        isLoading={isLoading}
        onToggle={handleToggle}
        onDelete={setDeleteId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="删除渠道"
        description="确定要删除该渠道吗？关联端点中的渠道绑定将被移除，端点本身不会删除。此操作不可撤销。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteChannel.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  )
}
