import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { getChannels } from '@/lib/channel/api'
import type { Channel } from '@/lib/channel/types'
import type {
  EndpointWithChannel,
  CreateEndpointDto,
  UpdateEndpointDto
} from '@/lib/endpoint/types'
import {
  createEndpointSchema,
  updateEndpointSchema
} from '@/lib/endpoint/validation'

interface EndpointFormProps {
  endpoint?: EndpointWithChannel
  onSubmit: (data: CreateEndpointDto | UpdateEndpointDto) => Promise<void>
  onCancel: () => void
}

export function EndpointForm({
  endpoint,
  onSubmit,
  onCancel
}: EndpointFormProps) {
  const [name, setName] = useState(endpoint?.name || '')
  const [channelId, setChannelId] = useState(endpoint?.channelId || '')
  const [msgType, setMsgType] = useState(
    (endpoint?.config as any)?.msg_type || 'text'
  )
  const [content, setContent] = useState(
    (endpoint?.config as any)?.content || ''
  )
  const [mentionedList, setMentionedList] = useState(
    (endpoint?.config as any)?.mentioned_list?.join(', ') || ''
  )
  const [mentionedMobileList, setMentionedMobileList] = useState(
    (endpoint?.config as any)?.mentioned_mobile_list?.join(', ') || ''
  )
  const [status, setStatus] = useState(endpoint?.status || 'active')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 获取可用的channels
  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)

  useEffect(() => {
    async function loadChannels() {
      try {
        const data = await getChannels()
        setChannels(data)
      } catch (err) {
        setError('加载渠道列表失败')
      } finally {
        setChannelsLoading(false)
      }
    }
    loadChannels()
  }, [])

  // 获取当前选中的渠道信息
  const selectedChannel = channels.find(c => c.id === channelId)
  const isWecomChannel = selectedChannel?.type === 'wecom'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 构建配置对象
      const config: any = {
        msg_type: msgType,
        content: content
      }

      // 如果是企业微信渠道，添加 mentioned_list 和 mentioned_mobile_list
      if (isWecomChannel) {
        if (mentionedList.trim()) {
          config.mentioned_list = mentionedList
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        }
        if (mentionedMobileList.trim()) {
          config.mentioned_mobile_list = mentionedMobileList
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        }
      }

      const data = {
        name,
        channelId,
        config,
        status
      }

      // 使用Zod验证
      const schema = endpoint ? updateEndpointSchema : createEndpointSchema
      const validatedData = schema.parse(data)

      await onSubmit(validatedData)
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
          <Label htmlFor="name">端点名称</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="我的API端点"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="channelId">关联渠道</Label>
          <Select
            value={channelId}
            onValueChange={setChannelId}
            disabled={isLoading || channelsLoading}
          >
            <SelectTrigger id="channelId" className="w-full">
              <SelectValue placeholder="选择渠道" />
            </SelectTrigger>
            <SelectContent>
              {channels.map(channel => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name} ({channel.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {channelsLoading && (
            <p className="text-xs text-muted-foreground">加载渠道中...</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="msgType">消息类型</Label>
          <Select
            value={msgType}
            onValueChange={setMsgType}
            disabled={isLoading}
          >
            <SelectTrigger id="msgType" className="w-full">
              <SelectValue placeholder="选择消息类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">文本消息</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">消息内容</Label>
          <Textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="请输入消息内容，支持模板语法：${body.path.to.value}"
            disabled={isLoading}
            rows={8}
            required
          />
          <p className="text-xs text-muted-foreground">
            支持模板语法从请求体中提取数据，例如：
            <code className="mx-1 px-1 py-0.5 bg-muted rounded">
              $&#123;body.data.message&#125;
            </code>
          </p>
        </div>

        {isWecomChannel && (
          <>
            <div className="space-y-2">
              <Label htmlFor="mentionedList">@提醒用户（可选）</Label>
              <Input
                id="mentionedList"
                value={mentionedList}
                onChange={e => setMentionedList(e.target.value)}
                placeholder="userid1, userid2, @all"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                多个用户用逗号分隔，使用 @all 提醒所有人
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentionedMobileList">@提醒手机号（可选）</Label>
              <Input
                id="mentionedMobileList"
                value={mentionedMobileList}
                onChange={e => setMentionedMobileList(e.target.value)}
                placeholder="13800001111, 13900002222, @all"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                多个手机号用逗号分隔，使用 @all 提醒所有人
              </p>
            </div>
          </>
        )}

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
          {isLoading ? '保存中...' : endpoint ? '更新端点' : '创建端点'}
        </Button>
      </div>
    </form>
  )
}
