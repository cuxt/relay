import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ChannelTypeSelect, ChannelTypeBadge } from './channel-type-select'
import type { ChannelType } from '@/lib/channels/constants'
import { useCreateChannel, useUpdateChannel } from '@/hooks/use-channels'

// 每种渠道类型需要的字段
const CHANNEL_FIELDS: Record<
  ChannelType,
  Array<{
    key: string
    label: string
    placeholder: string
    type?: string
    description?: string
  }>
> = {
  feishu: [
    {
      key: 'webhookUrl',
      label: 'Webhook 地址',
      placeholder: 'https://open.feishu.cn/open-apis/bot/v2/hook/...',
      description: '飞书自定义机器人的 Webhook 地址'
    },
    {
      key: 'secret',
      label: '签名密钥',
      placeholder: '签名密钥（可选）',
      description: '如果启用了签名校验，请填写密钥'
    }
  ],
  wecom: [
    {
      key: 'webhookUrl',
      label: 'Webhook 地址',
      placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
      description: '企业微信群机器人的 Webhook 地址'
    }
  ],
  wecom_app: [
    {
      key: 'corpId',
      label: 'Corp ID',
      placeholder: '企业 ID',
      description: '企业微信的企业 ID'
    },
    {
      key: 'agentId',
      label: 'Agent ID',
      placeholder: '应用 ID',
      description: '企业微信应用的 Agent ID'
    },
    {
      key: 'appSecret',
      label: 'App Secret',
      placeholder: '应用密钥',
      type: 'password',
      description: '企业微信应用的密钥'
    }
  ],
  dingtalk: [
    {
      key: 'webhookUrl',
      label: 'Webhook 地址',
      placeholder: 'https://oapi.dingtalk.com/robot/send?access_token=...',
      description: '钉钉自定义机器人的 Webhook 地址'
    },
    {
      key: 'secret',
      label: '签名密钥',
      placeholder: '签名密钥（可选）',
      description: '如果启用了加签，请填写密钥'
    }
  ],
  telegram: [
    {
      key: 'botToken',
      label: 'Bot Token',
      placeholder: '123456:ABC-DEF...',
      description: '通过 @BotFather 获取的 Bot Token'
    },
    {
      key: 'chatId',
      label: 'Chat ID',
      placeholder: '聊天 ID',
      description: '目标聊天/频道/群组的 ID'
    }
  ],
  discord: [
    {
      key: 'webhookUrl',
      label: 'Webhook 地址',
      placeholder: 'https://discord.com/api/webhooks/...',
      description: 'Discord 频道的 Webhook URL'
    }
  ],
  webhook: [
    {
      key: 'webhookUrl',
      label: 'URL',
      placeholder: 'https://...',
      description: '目标服务的 URL 地址'
    },
    {
      key: 'webhookMethod',
      label: '请求方法',
      placeholder: 'POST',
      description: '默认 POST，支持 GET/POST/PUT'
    }
  ],
  email: [],
  bark: [
    {
      key: 'barkServerUrl',
      label: 'Bark 服务器地址',
      placeholder: 'https://api.day.app',
      description: '自部署的 Bark 服务器地址'
    },
    {
      key: 'barkDeviceKey',
      label: '设备密钥',
      placeholder: '设备密钥',
      description: 'Bark App 中显示的设备密钥'
    }
  ]
}

interface ChannelFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: string
    name?: string
    type?: ChannelType
    enabled?: boolean
    [key: string]: unknown
  }
}

export function ChannelForm({ mode, defaultValues }: ChannelFormProps) {
  const navigate = useNavigate()
  const createChannel = useCreateChannel()
  const updateChannel = useUpdateChannel()

  const [type, setType] = useState<ChannelType | undefined>(defaultValues?.type)
  const [name, setName] = useState(defaultValues?.name || '')
  const [enabled, setEnabled] = useState(defaultValues?.enabled ?? true)
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (defaultValues && type) {
      // 从 CHANNEL_FIELDS 定义的字段读取
      for (const field of CHANNEL_FIELDS[type] || []) {
        const val = defaultValues[field.key]
        if (val !== undefined && val !== null) {
          initial[field.key] = String(val)
        }
      }
      // 邮件字段是动态渲染的，需要额外读取
      if (type === 'email') {
        const emailKeys = [
          'emailProvider',
          'smtpHost',
          'smtpPort',
          'smtpUser',
          'smtpPassword',
          'emailFrom',
          'emailTo',
          'resendApiKey'
        ]
        for (const key of emailKeys) {
          const val = defaultValues[key]
          if (val !== undefined && val !== null) {
            initial[key] = String(val)
          }
        }
      }
    }
    return initial
  })

  const isLoading = createChannel.isPending || updateChannel.isPending
  const currentFields = type ? CHANNEL_FIELDS[type] : []

  // Telegram 自动获取 Chat ID
  const [fetchingChats, setFetchingChats] = useState(false)
  const [telegramChats, setTelegramChats] = useState<
    Array<{ id: number; title: string; type: string }>
  >([])

  const handleFetchChatId = async () => {
    const botToken = fields.botToken
    if (!botToken) {
      toast.error('请先输入 Bot Token')
      return
    }

    setFetchingChats(true)
    try {
      const res = await fetch('/api/telegram/get-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken })
      })
      const json = await res.json()

      if (json.error) {
        toast.error(json.error.message)
        return
      }

      const chats = json.data?.chats || []
      if (chats.length === 0) {
        toast.error(
          '未找到聊天记录，请先向机器人发送一条消息或将机器人添加到群组'
        )
        return
      }

      setTelegramChats(chats)
      // 如果只有一个 chat，自动填入
      if (chats.length === 1) {
        setFields(prev => ({ ...prev, chatId: String(chats[0].id) }))
        toast.success(`已获取: ${chats[0].title}`)
      }
    } catch {
      toast.error('获取失败，请检查网络连接')
    } finally {
      setFetchingChats(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!type) {
      toast.error('请选择渠道类型')
      return
    }
    if (!name.trim()) {
      toast.error('请输入渠道名称')
      return
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
      type,
      enabled,
      ...Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== ''))
    }

    // 将 smtpPort 转为数字
    if (payload.smtpPort) {
      payload.smtpPort = Number(payload.smtpPort)
    }
    // smtpSecure
    if (type === 'email') {
      const provider = fields.emailProvider || 'smtp'
      payload.emailProvider = provider
      if (provider === 'smtp') {
        payload.smtpSecure = Number(fields.smtpPort || 465) === 465
      }
    }

    try {
      if (mode === 'edit' && defaultValues?.id) {
        await updateChannel.mutateAsync({
          id: defaultValues.id,
          data: payload as any
        })
        toast.success('渠道已更新')
      } else {
        await createChannel.mutateAsync(payload as any)
        toast.success('渠道已创建')
      }
      navigate({ to: '/channels' })
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 创建模式：渠道类型选择 */}
      {mode === 'create' && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">选择渠道类型</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelTypeSelect value={type} onChange={setType} />
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
                  <Label htmlFor="name">渠道名称</Label>
                  <Input
                    id="name"
                    placeholder="例如：技术团队飞书群"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>启用状态</Label>
                    <p className="text-sm text-muted-foreground">
                      禁用后该渠道将不会发送消息
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

            {/* 渠道配置 */}
            {type === 'email' ? (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">邮件配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>邮件提供商</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'smtp', label: 'SMTP' },
                        { value: 'resend', label: 'Resend' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setFields(prev => ({
                              ...prev,
                              emailProvider: opt.value
                            }))
                          }
                          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                            (fields.emailProvider || 'smtp') === opt.value
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(fields.emailProvider || 'smtp') === 'resend' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resendApiKey">API Key</Label>
                        <Input
                          id="resendApiKey"
                          type="password"
                          placeholder="re_..."
                          value={fields.resendApiKey || ''}
                          onChange={e =>
                            setFields(prev => ({
                              ...prev,
                              resendApiKey: e.target.value
                            }))
                          }
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          在 resend.com 控制台获取 API Key
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP 主机</Label>
                        <Input
                          id="smtpHost"
                          placeholder="smtp.example.com"
                          value={fields.smtpHost || ''}
                          onChange={e =>
                            setFields(prev => ({
                              ...prev,
                              smtpHost: e.target.value
                            }))
                          }
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP 端口</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          placeholder="465"
                          value={fields.smtpPort || ''}
                          onChange={e =>
                            setFields(prev => ({
                              ...prev,
                              smtpPort: e.target.value
                            }))
                          }
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUser">SMTP 用户名</Label>
                        <Input
                          id="smtpUser"
                          placeholder="user@example.com"
                          value={fields.smtpUser || ''}
                          onChange={e =>
                            setFields(prev => ({
                              ...prev,
                              smtpUser: e.target.value
                            }))
                          }
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP 密码</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          placeholder="密码"
                          value={fields.smtpPassword || ''}
                          onChange={e =>
                            setFields(prev => ({
                              ...prev,
                              smtpPassword: e.target.value
                            }))
                          }
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="emailFrom">发件人</Label>
                      <Input
                        id="emailFrom"
                        placeholder="sender@example.com"
                        value={fields.emailFrom || ''}
                        onChange={e =>
                          setFields(prev => ({
                            ...prev,
                            emailFrom: e.target.value
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailTo">收件人</Label>
                      <Input
                        id="emailTo"
                        placeholder="多个收件人用逗号分隔"
                        value={fields.emailTo || ''}
                        onChange={e =>
                          setFields(prev => ({
                            ...prev,
                            emailTo: e.target.value
                          }))
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              currentFields.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">渠道配置</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentFields.map(field => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>

                          {/* Telegram chatId 特殊处理 */}
                          {type === 'telegram' && field.key === 'chatId' ? (
                            <>
                              <div className="flex gap-2">
                                {telegramChats.length > 1 ? (
                                  <Select
                                    value={fields.chatId || ''}
                                    onValueChange={v =>
                                      setFields(prev => ({
                                        ...prev,
                                        chatId: v
                                      }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="选择聊天" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {telegramChats.map(chat => (
                                        <SelectItem
                                          key={chat.id}
                                          value={String(chat.id)}
                                        >
                                          {chat.title} ({chat.type})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id={field.key}
                                    placeholder={field.placeholder}
                                    value={fields[field.key] || ''}
                                    onChange={e =>
                                      setFields(prev => ({
                                        ...prev,
                                        [field.key]: e.target.value
                                      }))
                                    }
                                    disabled={isLoading}
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  disabled={fetchingChats || !fields.botToken}
                                  onClick={handleFetchChatId}
                                >
                                  {fetchingChats ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Search className="mr-1.5 h-3.5 w-3.5" />
                                  )}
                                  获取
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {field.description} —
                                点击「获取」自动查找（需先向机器人发送消息）
                              </p>
                            </>
                          ) : (
                            <>
                              <Input
                                id={field.key}
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                value={fields[field.key] || ''}
                                onChange={e =>
                                  setFields(prev => ({
                                    ...prev,
                                    [field.key]: e.target.value
                                  }))
                                }
                                disabled={isLoading}
                              />
                              {field.description && (
                                <p className="text-xs text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}

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
