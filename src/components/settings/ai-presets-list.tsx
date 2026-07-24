import { useState } from 'react'
import { Trash2, Pencil, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useAiPresetList, useDeleteAiPreset } from '@/hooks/use-ai-presets'
import { AiPresetDialog } from './ai-preset-dialog'

export function AiPresetsList() {
  const { data: presets, isLoading } = useAiPresetList()
  const deletePreset = useDeleteAiPreset()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editPreset, setEditPreset] = useState<any | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePreset.mutateAsync(deleteId)
      toast.success('AI 预设已删除')
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
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !presets?.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">暂无 AI 预设</p>
          <p className="mt-1 text-xs text-muted-foreground">
            创建一套 AI 处理配置用于消息处理
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {presets.map((p: any) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/30 p-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                  <Sparkles className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.key && (
                      <code className="shrink-0 rounded bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-border">
                        {p.key}
                      </code>
                    )}
                    <Badge variant="outline" className="shrink-0 text-xs font-normal">
                      {p.providerName || '-'}
                    </Badge>
                    <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                      {p.model}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {p.systemPrompt}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Badge
                  variant={p.enabled ? 'default' : 'secondary'}
                  className="text-xs font-normal"
                >
                  {p.enabled ? '启用' : '禁用'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditPreset(p)}
                  aria-label="编辑 AI 预设"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteId(p.id)}
                  aria-label="删除 AI 预设"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AiPresetDialog
        open={!!editPreset}
        onOpenChange={open => !open && setEditPreset(null)}
        preset={editPreset}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="删除 AI 预设"
        description="确定要删除该 AI 预设吗？已关联此预设的端点将取消关联。"
        confirmLabel="删除"
        variant="destructive"
        loading={deletePreset.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
