import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChannelTypeSelect, ChannelTypeBadge } from './channel-type-select'
import { ChannelFormFields } from './channel-form-fields'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/registry'
import { createChannelSchema } from '@/lib/channels/validation'
import { useCreateChannel, useUpdateChannel } from '@/hooks/use-channels'
import { setIn, flattenZodErrors } from '@/lib/channels/form-helpers'

interface ChannelFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: string
    name?: string
    type?: ChannelType
    enabled?: boolean
    config?: Record<string, unknown>
  }
}

function initialConfig(type: ChannelType): Record<string, unknown> {
  if (type === 'email') {
    return {
      provider: 'smtp',
      smtp: { host: '', port: 465, secure: true, user: '', password: '' },
      from: '',
      to: '',
    }
  }
  if (type === 'webhook') {
    return { method: 'POST' }
  }
  return {}
}

export function ChannelForm({ mode, defaultValues }: ChannelFormProps) {
  const navigate = useNavigate()
  const createChannel = useCreateChannel()
  const updateChannel = useUpdateChannel()

  const [type, setType] = useState<ChannelType>((defaultValues?.type || 'feishu') as ChannelType)
  const [name, setName] = useState(defaultValues?.name || '')
  const [enabled, setEnabled] = useState(defaultValues?.enabled ?? true)
  const [config, setConfig] = useState<Record<string, unknown>>(
    defaultValues?.config || initialConfig((defaultValues?.type || 'feishu') as ChannelType)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isLoading = createChannel.isPending || updateChannel.isPending

  function handleTypeChange(next: ChannelType) {
    setType(next)
    setConfig(initialConfig(next))
    setErrors({})
  }

  /** 点路径更新 config 嵌套对象 */
  function handleConfigChange(path: string, value: unknown) {
    // path 形如 `config.smtp.host`，去掉前缀 `config.`
    const rel = path.replace(/^config\./, '')
    setConfig((prev) => setIn(prev, rel, value))
    setErrors((prev) => {
      if (!prev[path]) return prev
      const next = { ...prev }
      delete next[path]
      return next
    })
  }

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    const values = { name, type, enabled, config }

    // 编辑模式只提交 name / enabled / config（type 不可改）
    const schema = mode === 'edit' ? null : createChannelSchema
    const payload =
      mode === 'edit'
        ? {
            name,
            enabled,
            config,
          }
        : values

    if (schema) {
      const result = schema.safeParse(payload)
      if (!result.success) {
        setErrors(flattenZodErrors(result.error.issues as any))
        toast.error('请检查表单填写')
        return
      }
      setErrors({})
      await submit(result.data)
    } else {
      await submit(payload)
    }
  }

  async function submit(data: any) {
    try {
      if (mode === 'edit' && defaultValues?.id) {
        await updateChannel.mutateAsync({
          id: defaultValues.id,
          data: { name: data.name, enabled: data.enabled, config: data.config },
        })
        toast.success('渠道已更新')
      } else {
        await createChannel.mutateAsync(data)
        toast.success('渠道已创建')
      }
      navigate({ to: '/channels' })
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* 创建模式：渠道类型选择 */}
      {mode === 'create' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-medium">渠道类型</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              选择接收消息的平台，切换类型会重置下方连接配置。
            </p>
          </div>
          <ChannelTypeSelect value={type} onChange={handleTypeChange} disabled={isLoading} />
        </section>
      )}

      <AnimatePresence mode="wait">
        {type && (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-10"
          >
            {/* 基本信息 */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-medium">基本信息</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    设置便于识别的名称，并决定渠道创建后是否立即启用。
                  </p>
                </div>
                {mode === 'edit' && <ChannelTypeBadge type={type} />}
              </div>

              <div className="border-y border-border">
                <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr] md:items-start">
                  <Label htmlFor="channel-name" className="md:pt-2.5">
                    渠道名称
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="channel-name"
                      placeholder="例如：技术团队飞书群"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      aria-invalid={!!errors['name']}
                    />
                    {errors['name'] && (
                      <p className="text-[0.8rem] font-medium text-destructive">{errors['name']}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 py-5 md:grid-cols-[9rem_1fr] md:items-center">
                  <Label htmlFor="channel-enabled">启用状态</Label>
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-sm text-muted-foreground">
                      禁用后，该渠道不会发送任何消息。
                    </p>
                    <Switch
                      id="channel-enabled"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 渠道配置 */}
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium">连接配置</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  填写 {CHANNEL_TYPES[type]?.label ?? '当前渠道'} 所需的鉴权与接收信息。
                </p>
              </div>
              <div className="border-t border-border pt-5">
                <div className="space-y-5">
                  <ChannelFormFields
                    type={type}
                    config={config}
                    onChange={handleConfigChange}
                    errors={errors}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            {/* 提交按钮 */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/channels' })}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {mode === 'edit' ? '保存更改' : '创建渠道'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
