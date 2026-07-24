import { useState, useRef, useCallback, useDeferredValue } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsUpDown, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { useChannelOptions } from '@/hooks/use-channels'
import { useCreateEndpoint, useUpdateEndpoint } from '@/hooks/use-endpoints'
import { useAiPresetList } from '@/hooks/use-ai-presets'
import { CHANNEL_TYPES, type ChannelType } from '@/lib/channels/constants'
import { createEndpointSchema } from '@/lib/endpoints/validation'
import { flattenZodErrors } from '@/lib/channels/form-helpers'
import { TEMPLATE_TOKENS } from '@/lib/push/template'

interface EndpointFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: string
    name?: string
    channelIds?: string[]
    channels?: Array<{ id: string; type: ChannelType; name: string }>
    enabled?: boolean
    messageTemplate?: string
    messageType?: string
    mentionedUserIds?: string
    mentionedMobiles?: string
  }
}

export function EndpointForm({ mode, defaultValues }: EndpointFormProps) {
  const navigate = useNavigate()
  const { data: presetsList } = useAiPresetList()
  const createEndpoint = useCreateEndpoint()
  const updateEndpoint = useUpdateEndpoint()

  const [name, setName] = useState(defaultValues?.name || '')
  const [channelIds, setChannelIds] = useState<string[]>(
    defaultValues?.channelIds ?? defaultValues?.channels?.map((channel) => channel.id) ?? []
  )
  const [channelPickerOpen, setChannelPickerOpen] = useState(false)
  const [channelSearch, setChannelSearch] = useState('')
  const [channelPage, setChannelPage] = useState(1)
  const [selectedChannels, setSelectedChannels] = useState(defaultValues?.channels ?? [])
  const [enabled, setEnabled] = useState(defaultValues?.enabled ?? true)
  const [messageTemplate, setMessageTemplate] = useState(defaultValues?.messageTemplate || '')
  const [messageType, setMessageType] = useState(defaultValues?.messageType || 'text')
  const [mentionedUserIds, setMentionedUserIds] = useState(defaultValues?.mentionedUserIds || '')
  const [mentionedMobiles, setMentionedMobiles] = useState(defaultValues?.mentionedMobiles || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const templateRef = useRef<HTMLTextAreaElement>(null)
  const deferredChannelSearch = useDeferredValue(channelSearch)
  const { data: channelOptions, isFetching: isFetchingChannels } = useChannelOptions({
    page: channelPage,
    limit: 10,
    search: deferredChannelSearch,
  })
  const channelsList = channelOptions?.items

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
  const commitTemplate = useCallback((next: string, forceNew: boolean) => {
    setMessageTemplate(next)
    const now = performance.now()
    if (!forceNew && now - lastEditAt.current < 600) {
      undoStack.current[undoStack.current.length - 1] = next
    } else {
      undoStack.current.push(next)
      redoStack.current = []
    }
    lastEditAt.current = now
  }, [])

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
    const cursorPos = cursorOffset ? start + token.length - cursorOffset : start + token.length
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = cursorPos
    })
  }

  const isLoading = createEndpoint.isPending || updateEndpoint.isPending

  // 当前选中的渠道类型
  const showMentionFields = selectedChannels.some(
    (channel: any) => channel.type === 'wecom' || channel.type === 'wecom_app'
  )

  function clearError(path: string) {
    setErrors((current) => {
      if (!current[path]) return current
      const next = { ...current }
      delete next[path]
      return next
    })
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    const result = createEndpointSchema.safeParse({
      name: name.trim(),
      channelIds,
      enabled,
      messageTemplate: messageTemplate || undefined,
      messageType: messageType as 'text' | 'markdown',
      mentionedUserIds: mentionedUserIds || undefined,
      mentionedMobiles: mentionedMobiles || undefined,
    })

    if (!result.success) {
      setErrors(flattenZodErrors(result.error.issues as any))
      toast.error('请检查表单填写')
      return
    }

    setErrors({})
    const payload = result.data

    try {
      if (mode === 'edit' && defaultValues?.id) {
        await updateEndpoint.mutateAsync({
          id: defaultValues.id,
          data: payload,
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
      className="space-y-10"
    >
      {/* 基本信息 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium">基本信息</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            设置端点名称、接收消息的渠道以及创建后的启用状态。
          </p>
        </div>

        <div className="border-y border-border">
          <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr] md:items-start">
            <Label htmlFor="endpoint-name" className="md:pt-2.5">
              端点名称
            </Label>
            <div className="space-y-2">
              <Input
                id="endpoint-name"
                placeholder="例如：GitHub Webhook"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearError('name')
                }}
                disabled={isLoading}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          </div>

          <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr] md:items-start">
            <Label className="md:pt-2.5">关联渠道</Label>
            <div className="space-y-2">
              <Popover open={channelPickerOpen} onOpenChange={setChannelPickerOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={channelPickerOpen}
                      aria-invalid={!!errors.channelIds}
                      className="h-auto min-h-9 w-full justify-between px-3 py-2 font-normal"
                      disabled={isLoading || (channelOptions?.total === 0 && !channelSearch)}
                    />
                  }
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {selectedChannels.slice(0, 3).map((channel: any) => (
                      <ChannelIcon
                        key={channel.id}
                        type={channel.type}
                        size="sm"
                        className="shrink-0"
                      />
                    ))}
                    <span className="truncate">
                      {selectedChannels.length === 0
                        ? '选择一个或多个渠道'
                        : selectedChannels.length <= 2
                          ? selectedChannels.map((channel: any) => channel.name).join('、')
                          : `已选择 ${selectedChannels.length} 个渠道`}
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-(--anchor-width) min-w-72 p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="搜索渠道名称或类型"
                      value={channelSearch}
                      onValueChange={(value) => {
                        setChannelSearch(value)
                        setChannelPage(1)
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isFetchingChannels ? '正在加载渠道…' : '没有找到匹配的渠道'}
                      </CommandEmpty>
                      <CommandGroup>
                        {channelsList?.map((channel: any) => {
                          const checked = channelIds.includes(channel.id)
                          return (
                            <CommandItem
                              key={channel.id}
                              value={`${channel.name} ${CHANNEL_TYPES[channel.type as ChannelType]?.label}`}
                              data-checked={checked}
                              onSelect={() => {
                                setChannelIds((current) =>
                                  checked
                                    ? current.filter((id) => id !== channel.id)
                                    : [...current, channel.id]
                                )
                                setSelectedChannels((current) =>
                                  checked
                                    ? current.filter((item) => item.id !== channel.id)
                                    : [...current, channel]
                                )
                                clearError('channelIds')
                              }}
                            >
                              <ChannelIcon type={channel.type} size="sm" className="shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate">{channel.name}</span>
                                <span className="block text-xs text-muted-foreground">
                                  {CHANNEL_TYPES[channel.type as ChannelType]?.label}
                                </span>
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                    <div className="flex items-center justify-between border-t px-2 py-2">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        第 {channelOptions?.page ?? channelPage} / {channelOptions?.totalPages ?? 1}{' '}
                        页
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="上一页渠道"
                          disabled={channelPage <= 1 || isFetchingChannels}
                          onClick={() => setChannelPage((page) => Math.max(1, page - 1))}
                        >
                          <ChevronLeft />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="下一页渠道"
                          disabled={
                            channelPage >= (channelOptions?.totalPages ?? 1) || isFetchingChannels
                          }
                          onClick={() =>
                            setChannelPage((page) =>
                              Math.min(channelOptions?.totalPages ?? page, page + 1)
                            )
                          }
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedChannels.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  已选择 {selectedChannels.length} 个渠道，请求将同时投递。
                </p>
              )}
              {errors.channelIds && <p className="text-sm text-destructive">{errors.channelIds}</p>}
              {channelOptions?.total === 0 && !channelSearch && (
                <p className="text-sm text-muted-foreground">暂无可用渠道，请先创建渠道。</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 py-5 md:grid-cols-[9rem_1fr] md:items-center">
            <Label htmlFor="endpoint-enabled">启用状态</Label>
            <div className="flex items-center justify-between gap-6">
              <p className="text-sm text-muted-foreground">禁用后，该端点不会处理推送请求。</p>
              <Switch
                id="endpoint-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 消息配置 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium">消息配置</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            定义推送内容格式，并使用变量从请求中提取消息内容。
          </p>
        </div>

        <div className="space-y-6 border-t border-border pt-5">
          <div className="grid gap-2 md:grid-cols-[9rem_1fr] md:items-center">
            <Label htmlFor="endpoint-message-type">消息格式</Label>
            <Select
              value={messageType}
              onValueChange={(value) => setMessageType(value ?? 'text')}
              disabled={isLoading}
            >
              <SelectTrigger id="endpoint-message-type" className="w-full sm:w-48">
                <SelectValue>{messageType === 'markdown' ? 'Markdown' : '纯文本'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">纯文本</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="endpoint-message-template">消息模板</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                留空时直接使用整个请求体；也可点击变量插入到当前光标位置。
              </p>
            </div>
            <Textarea
              ref={templateRef}
              id="endpoint-message-template"
              placeholder={'使用 ${payload.xxx} 引用请求体中的字段\n例如：${payload.content}'}
              value={messageTemplate}
              onChange={(e) => commitTemplate(e.target.value, false)}
              onKeyDown={handleTemplateKeyDown}
              disabled={isLoading}
              rows={7}
              className="min-h-40 resize-y font-mono text-sm leading-6"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 text-xs text-muted-foreground">插入变量</span>
              {TEMPLATE_TOKENS.filter((t) => t.category === 'builtin').map((item) => (
                <button
                  key={item.token}
                  type="button"
                  title={item.description}
                  onClick={() => insertToken(item.token, item.cursorOffset)}
                  className="inline-flex items-center rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
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
                                render={<div className="flex items-center gap-2 min-w-0" />}
                              >
                                <code className="text-xs font-semibold shrink-0">{p.key}</code>
                                <span className="text-xs text-muted-foreground truncate">
                                  {p.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-md">
                                <p className="text-xs break-all">{p.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  ) : (
                    <div className="px-2 py-3 text-center">
                      <p className="text-xs text-muted-foreground">暂无 AI 预设</p>
                      <p className="text-xs text-muted-foreground mt-1">请先在设置中创建</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showMentionFields && (
            <div className="space-y-4 rounded-lg bg-muted/40 p-4">
              <div>
                <h3 className="text-sm font-medium">企微提醒</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  可选，仅纯文本消息支持指定成员或手机号提醒。
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mentionedUserIds">@用户 ID</Label>
                  <Input
                    id="mentionedUserIds"
                    placeholder="多个 ID 用逗号分隔，@all 表示所有人"
                    value={mentionedUserIds}
                    onChange={(e) => setMentionedUserIds(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentionedMobiles">@手机号</Label>
                  <Input
                    id="mentionedMobiles"
                    placeholder="多个手机号用逗号分隔"
                    value={mentionedMobiles}
                    onChange={(e) => setMentionedMobiles(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 提交按钮 */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/endpoints' })}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {mode === 'edit' ? '保存更改' : '创建端点'}
        </Button>
      </div>
    </motion.form>
  )
}
