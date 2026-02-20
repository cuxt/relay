import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { Switch } from '@/components/ui/switch'
import {
  useCreateAiProvider,
  useUpdateAiProvider
} from '@/hooks/use-ai-providers'

interface AiProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: {
    id: string
    name: string
    baseUrl: string
    apiKey: string
    enabled: boolean
  } | null
}

export function AiProviderDialog({
  open,
  onOpenChange,
  provider
}: AiProviderDialogProps) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [enabled, setEnabled] = useState(true)

  const createProvider = useCreateAiProvider()
  const updateProvider = useUpdateAiProvider()
  const isEdit = !!provider
  const isLoading = createProvider.isPending || updateProvider.isPending

  useEffect(() => {
    if (open && provider) {
      setName(provider.name)
      setBaseUrl(provider.baseUrl)
      setApiKey('')
      setEnabled(provider.enabled)
    } else if (open) {
      setName('')
      setBaseUrl('')
      setApiKey('')
      setEnabled(true)
    }
  }, [open, provider])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入名称')
      return
    }
    if (!baseUrl.trim()) {
      toast.error('请输入 Base URL')
      return
    }
    if (!isEdit && !apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    try {
      if (isEdit) {
        const data: Record<string, any> = {
          name: name.trim(),
          baseUrl: baseUrl.trim(),
          enabled
        }
        if (apiKey.trim()) {
          data.apiKey = apiKey.trim()
        }
        await updateProvider.mutateAsync({ id: provider!.id, data })
        toast.success('AI 服务已更新')
      } else {
        await createProvider.mutateAsync({
          name: name.trim(),
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim(),
          enabled
        })
        toast.success('AI 服务已创建')
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑 AI 服务' : '添加 AI 服务'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改 AI 服务配置' : '添加一个 OpenAI 兼容的 AI 服务端点'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider-name">名称</Label>
            <Input
              id="provider-name"
              placeholder="例如：Deepseek"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-base-url">Base URL</Label>
            <Input
              id="provider-base-url"
              placeholder="例如：https://api.deepseek.com/v1"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider-api-key">
              API Key{isEdit && ' (留空则不修改)'}
            </Label>
            <Input
              id="provider-api-key"
              type="password"
              placeholder={isEdit ? '留空则保持原 Key 不变' : '输入 API Key'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>启用</Label>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
