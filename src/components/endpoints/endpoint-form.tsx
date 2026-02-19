import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { useChannelList } from '@/hooks/use-channels'
import { useCreateEndpoint, useUpdateEndpoint } from '@/hooks/use-endpoints'
import { CHANNEL_TYPES, type ChannelType } from '@/lib/channels/constants'
import { TEMPLATE_BUILTINS } from '@/lib/push/template'

interface EndpointFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: string
    name?: string
    channelId?: string
    enabled?: boolean
    messageTemplate?: string
    messageType?: string
    mentionedUserIds?: string
    mentionedMobiles?: string
  }
}

export function EndpointForm({ mode, defaultValues }: EndpointFormProps) {
  const navigate = useNavigate()
  const { data: channelsList } = useChannelList()
  const createEndpoint = useCreateEndpoint()
  const updateEndpoint = useUpdateEndpoint()

  const [name, setName] = useState(defaultValues?.name || '')
  const [channelId, setChannelId] = useState(defaultValues?.channelId || '')
  const [enabled, setEnabled] = useState(defaultValues?.enabled ?? true)
  const [messageTemplate, setMessageTemplate] = useState(
    defaultValues?.messageTemplate || ''
  )
  const [messageType, setMessageType] = useState(
    defaultValues?.messageType || 'text'
  )
  const [mentionedUserIds, setMentionedUserIds] = useState(
    defaultValues?.mentionedUserIds || ''
  )
  const [mentionedMobiles, setMentionedMobiles] = useState(
    defaultValues?.mentionedMobiles || ''
  )
  const templateRef = useRef<HTMLTextAreaElement>(null)

  const insertToken = (token: string) => {
    const el = templateRef.current
    if (!el) {
      setMessageTemplate(prev => prev + token)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = messageTemplate.slice(0, start)
    const after = messageTemplate.slice(end)
    setMessageTemplate(before + token + after)
    // 恢复光标位置
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    })
  }

  const isLoading = createEndpoint.isPending || updateEndpoint.isPending

  // 当前选中的渠道类型
  const selectedChannel = channelsList?.find((c: any) => c.id === channelId)
  const showMentionFields =
    selectedChannel?.type === 'wecom' || selectedChannel?.type === 'wecom_app'

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('请输入端点名称')
      return
    }
    if (!channelId) {
      toast.error('请选择关联渠道')
      return
    }

    const payload = {
      name: name.trim(),
      channelId,
      enabled,
      messageTemplate: messageTemplate || undefined,
      messageType: messageType as 'text' | 'markdown',
      mentionedUserIds: mentionedUserIds || undefined,
      mentionedMobiles: mentionedMobiles || undefined
    }

    try {
      if (mode === 'edit' && defaultValues?.id) {
        await updateEndpoint.mutateAsync({
          id: defaultValues.id,
          data: payload
        })
        toast.success('端点已更新')
      } else {
        await createEndpoint.mutateAsync(payload)
        toast.success('端点已创建')
      }
      navigate({ to: '/endpoints' })
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* 基本信息 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">端点名称</Label>
              <Input
                id="name"
                placeholder="例如：GitHub Webhook"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">关联渠道</Label>
              <Select
                value={channelId}
                onValueChange={setChannelId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择渠道" />
                </SelectTrigger>
                <SelectContent>
                  {channelsList?.map((ch: any) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      <div className="flex items-center gap-2">
                        <ChannelIcon type={ch.type} size="sm" />
                        <span>{ch.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {CHANNEL_TYPES[ch.type as ChannelType]?.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>启用状态</Label>
              <p className="text-sm text-muted-foreground">
                禁用后该端点将不会处理推送请求
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 消息配置 */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">消息配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="messageType">消息格式</Label>
            <Select
              value={messageType}
              onValueChange={setMessageType}
              disabled={isLoading}
            >
              <SelectTrigger className="w-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">纯文本</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">消息模板</Label>
            <Textarea
              ref={templateRef}
              id="messageTemplate"
              placeholder={
                '使用 ${body.xxx} 引用请求体中的字段\n例如：${body.content}'
              }
              value={messageTemplate}
              onChange={e => setMessageTemplate(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="font-mono text-sm"
            />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                留空则使用整个请求体作为消息内容。点击下方变量快捷插入到模板中。
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_BUILTINS.map(item => (
                  <button
                    key={item.token}
                    type="button"
                    title={item.description}
                    onClick={() => insertToken(item.token)}
                    className="inline-flex items-center rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showMentionFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="mentionedUserIds">@用户 ID</Label>
                <Input
                  id="mentionedUserIds"
                  placeholder="多个 ID 用逗号分隔，@all 表示所有人"
                  value={mentionedUserIds}
                  onChange={e => setMentionedUserIds(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentionedMobiles">@手机号</Label>
                <Input
                  id="mentionedMobiles"
                  placeholder="多个手机号用逗号分隔"
                  value={mentionedMobiles}
                  onChange={e => setMentionedMobiles(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? '保存更改' : '创建端点'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/endpoints' })}
          disabled={isLoading}
        >
          取消
        </Button>
      </div>
    </motion.form>
  )
}
