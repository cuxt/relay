import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateApiKey } from '@/hooks/use-api-keys'
import { CopyButton } from '@/components/shared/copy-button'

interface ApiKeyCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyCreateDialog({
  open,
  onOpenChange
}: ApiKeyCreateDialogProps) {
  const [name, setName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const createApiKey = useCreateApiKey()

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      const result = await createApiKey.mutateAsync({ name: name.trim() })
      setCreatedKey(result.key)
    } catch {
      // error handled by mutation
    }
  }

  const handleClose = () => {
    setName('')
    setCreatedKey(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {createdKey ? 'API 密钥已创建' : '创建 API 密钥'}
          </DialogTitle>
          <DialogDescription>
            {createdKey
              ? '请立即复制密钥，关闭后无法再次查看'
              : '创建一个新的 API 密钥用于接口认证'}
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                请立即复制此密钥，关闭后将无法再次查看完整密钥。
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <code className="text-xs font-mono flex-1 break-all">
                {createdKey}
              </code>
              <CopyButton value={createdKey} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">密钥名称</Label>
              <Input
                id="keyName"
                placeholder="例如：CI/CD 部署"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={createApiKey.isPending}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {createdKey ? (
            <Button onClick={handleClose}>完成</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || createApiKey.isPending}
              >
                {createApiKey.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                创建
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
