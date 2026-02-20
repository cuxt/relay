import { useState } from 'react'
import { Trash2, Pencil, Server } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  useAiProviderList,
  useDeleteAiProvider
} from '@/hooks/use-ai-providers'
import { AiProviderDialog } from './ai-provider-dialog'

export function AiProvidersList() {
  const { data: providers, isLoading } = useAiProviderList()
  const deleteProvider = useDeleteAiProvider()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editProvider, setEditProvider] = useState<any | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProvider.mutateAsync(deleteId)
      toast.success('AI 服务已删除')
      setDeleteId(null)
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !providers?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
            <Server className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">暂无 AI 服务</p>
          <p className="text-xs text-muted-foreground mt-1">
            添加一个 OpenAI 兼容的 AI 服务端点
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {providers.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Server className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.baseUrl}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                  {p.apiKey}
                </span>
                <Badge
                  variant={p.enabled ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {p.enabled ? '启用' : '禁用'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditProvider(p)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AiProviderDialog
        open={!!editProvider}
        onOpenChange={open => !open && setEditProvider(null)}
        provider={editProvider}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="删除 AI 服务"
        description="确定要删除该 AI 服务吗？关联的所有 AI 预设也将被删除。"
        confirmLabel="删除"
        variant="destructive"
        loading={deleteProvider.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
