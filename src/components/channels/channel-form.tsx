import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChannelTypeSelect, ChannelTypeBadge } from './channel-type-select'
import { ChannelFormFields } from './channel-form-fields'
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
      to: ''
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

  const [type, setType] = useState<ChannelType>(
    (defaultValues?.type || 'feishu') as ChannelType
  )
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
    setConfig(prev => setIn(prev, rel, value))
    setErrors(prev => {
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
    const payload = mode === 'edit' ? {
      name,
      enabled,
      config
    } : values

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
          data: { name: data.name, enabled: data.enabled, config: data.config }
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
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 创建模式：渠道类型选择 */}
      {mode === 'create' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">选择渠道类型</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelTypeSelect
              value={type}
              onChange={handleTypeChange}
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="wait">
        {type && (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">基本信息</CardTitle>
                  {mode === 'edit' && <ChannelTypeBadge type={type} />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-name">渠道名称</Label>
                  <Input
                    id="channel-name"
                    placeholder="例如：技术团队飞书群"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!errors['name']}
                  />
                  {errors['name'] && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errors['name']}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>启用状态</Label>
                    <p className="text-sm text-muted-foreground">禁用后该渠道将不会发送消息</p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 渠道配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">渠道配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChannelFormFields
                  type={type}
                  config={config}
                  onChange={handleConfigChange}
                  errors={errors}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'edit' ? '保存更改' : '创建渠道'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/channels' })}
                disabled={isLoading}
              >
                取消
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
