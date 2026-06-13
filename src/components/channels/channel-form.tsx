import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { ChannelTypeSelect, ChannelTypeBadge } from './channel-type-select'
import { ChannelFormFields } from './channel-form-fields'
import type { ChannelType } from '@/lib/channels/registry'
import { createChannelSchema } from '@/lib/channels/validation'
import { useCreateChannel, useUpdateChannel } from '@/hooks/use-channels'

interface FormValues {
  name: string
  type: ChannelType
  enabled: boolean
  config: Record<string, unknown>
}

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

export function ChannelForm({ mode, defaultValues }: ChannelFormProps) {
  const navigate = useNavigate()
  const createChannel = useCreateChannel()
  const updateChannel = useUpdateChannel()

  const form = useForm<FormValues>({
    resolver: zodResolver(createChannelSchema) as any,
    defaultValues: {
      name: defaultValues?.name || '',
      type: (defaultValues?.type || 'feishu') as ChannelType,
      enabled: defaultValues?.enabled ?? true,
      config: defaultValues?.config || {}
    }
  })

  const selectedType = form.watch('type') as ChannelType
  const isLoading = createChannel.isPending || updateChannel.isPending

  async function onSubmit(data: FormValues) {
    try {
      if (mode === 'edit' && defaultValues?.id) {
        await updateChannel.mutateAsync({
          id: defaultValues.id,
          data: {
            name: data.name,
            enabled: data.enabled,
            config: data.config
          }
        })
        toast.success('渠道已更新')
      } else {
        await createChannel.mutateAsync(data as any)
        toast.success('渠道已创建')
      }
      navigate({ to: '/channels' })
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 创建模式：渠道类型选择 */}
        {mode === 'create' && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">选择渠道类型</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <ChannelTypeSelect
                    value={field.value}
                    onChange={(v: ChannelType) => {
                      field.onChange(v)
                      // 切换类型时重置 config
                      form.setValue('config', {})
                    }}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="wait">
          {selectedType && (
            <motion.div
              key={selectedType}
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
                    {mode === 'edit' && <ChannelTypeBadge type={selectedType} />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>渠道名称</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例如：技术团队飞书群"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>启用状态</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            禁用后该渠道将不会发送消息
                          </p>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 渠道配置 */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">渠道配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChannelFormFields
                    type={selectedType}
                    form={form}
                  />
                </CardContent>
              </Card>

              {/* 提交按钮 */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
    </Form>
  )
}
