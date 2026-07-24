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
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !providers?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
            <Server className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">暂无 AI 服务</p>
          <p className="mt-1 text-xs text-muted-foreground">
            添加一个 OpenAI 兼容的 AI 服务端点
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {providers.map((p: any) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/30 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                  <Server className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.baseUrl}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <span className="hidden max-w-28 truncate font-mono text-xs text-muted-foreground sm:inline">
                  {p.apiKey}
                </span>
                <Badge
                  variant={p.enabled ? 'default' : 'secondary'}
                  className="text-xs font-normal"
                >
                  {p.enabled ? '启用' : '禁用'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditProvider(p)}
                  aria-label="编辑 AI 服务"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteId(p.id)}
                  aria-label="删除 AI 服务"
                >
                  <Trash2 className="size-4" />
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
