import { useState } from 'react'
import { Plus, Trash2, Key } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ApiKeyCreateDialog } from './api-key-create-dialog'
import { useApiKeyList, useDeleteApiKey } from '@/hooks/use-api-keys'

export function ApiKeysList() {
  const { data: keys, isLoading } = useApiKeyList()
  const deleteApiKey = useDeleteApiKey()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteApiKey.mutateAsync(deleteId)
      toast.success('密钥已删除')
      setDeleteId(null)
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API 密钥</h2>
          <p className="text-sm text-muted-foreground">
            管理用于 API 认证的密钥
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          创建密钥
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !keys?.length ? (
        <EmptyState
          icon={<Key className="h-6 w-6" />}
          title="暂无 API 密钥"
          description="创建一个 API 密钥用于程序化访问"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建密钥
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {keys.map((key: any) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {key.keyPreview}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={key.enabled ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {key.enabled ? '活跃' : '禁用'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {key.lastUsedAt
                      ? `最近使用: ${new Date(key.lastUsedAt).toLocaleDateString('zh-CN')}`
                      : '从未使用'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ApiKeyCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="删除 API 密钥"
        description="确定要删除该密钥吗？使用此密钥的应用将无法继续访问 API。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteApiKey.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
