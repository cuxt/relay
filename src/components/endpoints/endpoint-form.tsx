import { useState, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { useChannelList } from '@/hooks/use-channels'
import { useCreateEndpoint, useUpdateEndpoint } from '@/hooks/use-endpoints'
import { useAiPresetList } from '@/hooks/use-ai-presets'
import { CHANNEL_TYPES, type ChannelType } from '@/lib/channels/constants'
import { TEMPLATE_TOKENS } from '@/lib/push/template'

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
  const { data: presetsList } = useAiPresetList()
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

  // 自管撤销/重做栈，使 Ctrl+Z 可撤销通过按钮插入的 token
  // （受控 setState 替换值会清空浏览器原生 undo 历史）
  const undoStack = useRef<string[]>([defaultValues?.messageTemplate || ''])
  const redoStack = useRef<string[]>([])
  const lastEditAt = useRef(0)

  /**
   * 统一模板写入入口：
   * - forceNew=true（如插入 token）：新压一条历史，清空 redo
   * - forceNew=false（如手动键入）：600ms 内视为同一次连续编辑，覆盖末条
   */
  const commitTemplate = useCallback(
    (next: string, forceNew: boolean) => {
      setMessageTemplate(next)
      const now = performance.now()
      if (!forceNew && now - lastEditAt.current < 600) {
        undoStack.current[undoStack.current.length - 1] = next
      } else {
        undoStack.current.push(next)
        redoStack.current = []
      }
      lastEditAt.current = now
    },
    []
  )

  const undoTemplate = useCallback(() => {
    if (undoStack.current.length <= 1) return
    const current = undoStack.current.pop()
    if (current === undefined) return
    redoStack.current.push(current)
    const prev = undoStack.current[undoStack.current.length - 1]
    if (prev === undefined) return
    setMessageTemplate(prev)
    requestAnimationFrame(() => {
      const el = templateRef.current
      if (el) {
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
      }
    })
  }, [])

  const redoTemplate = useCallback(() => {
    if (!redoStack.current.length) return
    const next = redoStack.current.pop()
    if (next === undefined) return
    undoStack.current.push(next)
    setMessageTemplate(next)
    requestAnimationFrame(() => {
      const el = templateRef.current
      if (el) {
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
      }
    })
  }, [])

  const handleTemplateKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoTemplate()
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        redoTemplate()
      }
    },
    [undoTemplate, redoTemplate]
  )

  const insertToken = (token: string, cursorOffset?: number) => {
    const el = templateRef.current
    if (!el) {
      commitTemplate(messageTemplate + token, true)
      return
    }
    el.focus()
    const start = el.selectionStart
    const end = el.selectionEnd
    const before = messageTemplate.slice(0, start)
    const after = messageTemplate.slice(end)
    const next = before + token + after
    commitTemplate(next, true)
    // 恢复光标位置
    const cursorPos = cursorOffset
      ? start + token.length - cursorOffset
      : start + token.length
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = cursorPos
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
                onValueChange={value => setChannelId(value ?? '')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择渠道">
                    {(value: string | null) => {
                      if (!value) return '选择渠道'
                      const ch = channelsList?.find((c: any) => c.id === value)
                      return ch?.name ?? value
                    }}
                  </SelectValue>
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
              onValueChange={value => setMessageType(value ?? 'text')}
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
                '使用 ${payload.xxx} 引用请求体中的字段\n例如：${payload.content}'
              }
              value={messageTemplate}
              onChange={e => commitTemplate(e.target.value, false)}
              onKeyDown={handleTemplateKeyDown}
              disabled={isLoading}
              rows={4}
              className="font-mono text-sm"
            />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                留空则使用整个请求体作为消息内容。点击下方变量快捷插入到模板中。
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_TOKENS.filter(t => t.category === 'builtin').map(
                  item => (
                    <button
                      key={item.token}
                      type="button"
                      title={item.description}
                      onClick={() => insertToken(item.token, item.cursorOffset)}
                      className="inline-flex items-center rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  )
                )}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        title="插入 AI 调用"
                        className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      />
                    }
                  >
                    <Sparkles className="h-3 w-3" />
                    ai()
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {presetsList?.length ? (
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>选择 AI 预设</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {presetsList.map((p: any) => (
                          <DropdownMenuItem
                            key={p.id}
                            onClick={() => {
                              const token = `\${await ai('${p.key}', )}`
                              // cursorOffset = 2 → 光标在 )} 之前，即第二个参数位置
                              insertToken(token, 2)
                            }}
                          >
                            <TooltipProvider delay={300}>
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <div className="flex items-center gap-2 min-w-0" />
                                  }
                                >
                                  <code className="text-xs font-semibold shrink-0">
                                    {p.key}
                                  </code>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {p.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-md">
                                  <p className="text-xs break-all">
                                    {p.name}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    ) : (
                      <div className="px-2 py-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          暂无 AI 预设
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          请先在设置中创建
                        </p>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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
