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
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !presets?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">暂无 AI 预设</p>
          <p className="text-xs text-muted-foreground mt-1">
            创建一套 AI 处理配置用于消息处理
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {presets.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.key && (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground shrink-0">
                        {p.key}
                      </code>
                    )}
                    <Badge variant="outline" className="text-xs shrink-0">
                      {p.providerName || '-'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {p.model}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {p.systemPrompt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
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
                  onClick={() => setEditPreset(p)}
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
