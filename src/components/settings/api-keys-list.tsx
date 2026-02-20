import { useState } from 'react'
import { Trash2, Key } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useApiKeyList, useDeleteApiKey } from '@/hooks/use-api-keys'

export function ApiKeysList() {
  const { data: keys, isLoading } = useApiKeyList()
  const deleteApiKey = useDeleteApiKey()
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
    <>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !keys?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">暂无 API 密钥</p>
          <p className="text-xs text-muted-foreground mt-1">
            创建一个密钥用于程序化访问
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {keys.map((key: any) => (
            <div
              key={key.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{key.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {key.keyPreview}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Badge
                  variant={key.enabled ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {key.enabled ? '活跃' : '禁用'}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {key.lastUsedAt
                    ? `${new Date(key.lastUsedAt).toLocaleDateString('zh-CN')}`
                    : '从未使用'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(key.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </>
  )
}
