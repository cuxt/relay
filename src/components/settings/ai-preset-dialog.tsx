import { useState, useEffect } from 'react'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
  useAiProviderList,
  useAiProviderModels
} from '@/hooks/use-ai-providers'
import { useCreateAiPreset, useUpdateAiPreset } from '@/hooks/use-ai-presets'

interface AiPresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset?: {
    id: string
    name: string
    key: string
    providerId: string
    model: string
    systemPrompt: string
    enabled: boolean
  } | null
}

export function AiPresetDialog({
  open,
  onOpenChange,
  preset
}: AiPresetDialogProps) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [providerId, setProviderId] = useState('')
  const [model, setModel] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [modelOpen, setModelOpen] = useState(false)
  const [modelSearch, setModelSearch] = useState('')

  const { data: providers } = useAiProviderList()
  const {
    data: models,
    isLoading: modelsLoading,
    error: modelsError
  } = useAiProviderModels(providerId)
  const createPreset = useCreateAiPreset()
  const updatePreset = useUpdateAiPreset()
  const isEdit = !!preset
  const isLoading = createPreset.isPending || updatePreset.isPending

  useEffect(() => {
    if (open && preset) {
      setName(preset.name)
      setKey(preset.key)
      setProviderId(preset.providerId)
      setModel(preset.model)
      setSystemPrompt(preset.systemPrompt)
      setEnabled(preset.enabled)
    } else if (open) {
      setName('')
      setKey('')
      setProviderId('')
      setModel('')
      setSystemPrompt('')
      setEnabled(true)
    }
  }, [open, preset])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入名称')
      return
    }
    if (!key.trim()) {
      toast.error('请输入 Key')
      return
    }
    if (!providerId) {
      toast.error('请选择 AI 服务')
      return
    }
    if (!model.trim()) {
      toast.error('请选择或输入模型名称')
      return
    }
    if (!systemPrompt.trim()) {
      toast.error('请输入系统提示词')
      return
    }

    try {
      const payload = {
        name: name.trim(),
        key: key.trim(),
        providerId,
        model: model.trim(),
        systemPrompt: systemPrompt.trim(),
        enabled
      }

      if (isEdit) {
        await updatePreset.mutateAsync({ id: preset!.id, data: payload })
        toast.success('AI 预设已更新')
      } else {
        await createPreset.mutateAsync(payload)
        toast.success('AI 预设已创建')
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
          <DialogTitle>{isEdit ? '编辑 AI 预设' : '添加 AI 预设'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '修改 AI 预设配置'
              : '创建一套 AI 处理配置（模型 + 提示词）'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">名称</Label>
            <Input
              id="preset-name"
              placeholder="例如：翻译为英文"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-key">Key</Label>
            <Input
              id="preset-key"
              placeholder="例如：translate"
              value={key}
              onChange={e => setKey(e.target.value)}
              disabled={isLoading}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {'仅限字母和下划线。在模板中通过 ${ai.key(...)} 调用'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-provider">AI 服务</Label>
            <Select
              value={providerId}
              onValueChange={v => {
                setProviderId(v ?? '')
                setModel('')
                setModelSearch('')
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择 AI 服务">
                  {(value: string | null) => {
                    if (!value) return '选择 AI 服务'
                    const p = providers?.find((p: any) => p.id === value)
                    return p?.name ?? value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {providers?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>模型</Label>
            <Popover open={modelOpen} onOpenChange={setModelOpen} modal>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={modelOpen}
                    className="w-full justify-between font-mono text-xs"
                    disabled={!providerId || isLoading}
                  />
                }
              >
                <span className="truncate">
                  {model ||
                    (providerId ? '搜索或输入模型...' : '请先选择 AI 服务')}
                </span>
                {modelsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin opacity-50" />
                ) : (
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="搜索或输入模型名称..."
                    value={modelSearch}
                    onValueChange={setModelSearch}
                  />
                  <CommandList>
                    {modelsError ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-destructive mb-2">
                          获取模型列表失败
                        </p>
                        <p className="text-xs text-muted-foreground">
                          可直接输入模型名称后回车
                        </p>
                      </div>
                    ) : modelsLoading ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        加载中...
                      </div>
                    ) : (
                      <>
                        {/* 手动输入项：当搜索词不在列表中时显示 */}
                        {modelSearch.trim() &&
                          !models?.some(
                            (m: string) =>
                              m.toLowerCase() ===
                              modelSearch.trim().toLowerCase()
                          ) && (
                            <CommandGroup heading="手动输入">
                              <CommandItem
                                value={`__custom__${modelSearch.trim()}`}
                                onSelect={() => {
                                  setModel(modelSearch.trim())
                                  setModelOpen(false)
                                }}
                                className="font-mono text-xs"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    model === modelSearch.trim()
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {modelSearch.trim()}
                              </CommandItem>
                            </CommandGroup>
                          )}
                        {(() => {
                          const filtered = (models || []).filter((m: string) =>
                            m.toLowerCase().includes(modelSearch.toLowerCase())
                          )
                          if (filtered.length === 0 && !modelSearch.trim()) {
                            return <CommandEmpty>暂无可用模型</CommandEmpty>
                          }
                          return (
                            <CommandGroup heading="可用模型">
                              {filtered.map((m: string) => (
                                <CommandItem
                                  key={m}
                                  value={m}
                                  onSelect={() => {
                                    setModel(m)
                                    setModelOpen(false)
                                  }}
                                  className="font-mono text-xs"
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      model === m ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {m}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )
                        })()}
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-prompt">系统提示词</Label>
            <Textarea
              id="preset-prompt"
              placeholder="例如：将用户消息翻译为英文，只返回翻译结果"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="max-h-40"
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
