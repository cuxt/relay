import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CHANNEL_TYPES } from '@/lib/channel'
import type {
  Channel,
  CreateChannelDto,
  UpdateChannelDto
} from '@/lib/channel/types'
import {
  createChannelSchema,
  updateChannelSchema
} from '@/lib/channel/validation'

interface ChannelFormProps {
  channel?: Channel
  onSubmit: (data: CreateChannelDto | UpdateChannelDto) => Promise<void>
  onCancel: () => void
}

export function ChannelForm({ channel, onSubmit, onCancel }: ChannelFormProps) {
  const [name, setName] = useState(channel?.name || '')
  const [type, setType] = useState(channel?.type || CHANNEL_TYPES.FEISHU)
  const [webhook, setWebhook] = useState(
    (channel?.config as any)?.webhook || ''
  )
  const [secret, setSecret] = useState((channel?.config as any)?.secret || '')
  const [status, setStatus] = useState(channel?.status || 'active')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = {
        name,
        type,
        config: {
          webhook,
          secret: secret || undefined
        },
        status
      }

      // Validate
      const schema = channel ? updateChannelSchema : createChannelSchema
      schema.parse(data)

      await onSubmit(data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('发生了一个错误')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">渠道名称</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="我的飞书机器人"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">渠道类型</Label>
          <Select
            value={type}
            onValueChange={value => setType(value as any)}
            disabled={isLoading}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CHANNEL_TYPES.FEISHU}>飞书</SelectItem>
              <SelectItem value={CHANNEL_TYPES.DINGTALK} disabled>
                钉钉（即将支持）
              </SelectItem>
              <SelectItem value={CHANNEL_TYPES.WECOM} disabled>
                企业微信（即将支持）
              </SelectItem>
              <SelectItem value={CHANNEL_TYPES.TELEGRAM} disabled>
                Telegram（即将支持）
              </SelectItem>
              <SelectItem value={CHANNEL_TYPES.DISCORD} disabled>
                Discord（即将支持）
              </SelectItem>
              <SelectItem value={CHANNEL_TYPES.WEBHOOK} disabled>
                Webhook（即将支持）
              </SelectItem>
              <SelectItem value={CHANNEL_TYPES.EMAIL} disabled>
                邮件（即将支持）
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook">Webhook 地址</Label>
          <Input
            id="webhook"
            type="url"
            value={webhook}
            onChange={e => setWebhook(e.target.value)}
            placeholder="https://example.com/webhook"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret">签名密钥（可选）</Label>
          <Input
            id="secret"
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="输入签名密钥"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="status">状态</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {status === 'active' ? '启用' : '禁用'}
            </span>
            <Switch
              id="status"
              checked={status === 'active'}
              onCheckedChange={checked =>
                setStatus(checked ? 'active' : 'inactive')
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : channel ? '更新渠道' : '创建渠道'}
        </Button>
      </div>
    </form>
  )
}
