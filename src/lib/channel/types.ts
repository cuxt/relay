import type { ChannelType } from './index'

// 飞书渠道配置
export interface FeishuConfig {
  webhook: string
  secret?: string
}

// 钉钉渠道配置
export interface DingtalkConfig {
  webhook: string
  secret?: string
}

// 企业微信渠道配置
export interface WecomConfig {
  webhook: string
}

// 企业微信文本消息参数
export interface WecomTextMessageOptions {
  /** 文本内容，最长不超过2048个字节，必须是utf8编码 */
  content: string
  /** userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人 */
  mentioned_list?: string[]
  /** 手机号列表，提醒手机号对应的群成员(@某个成员)，@all表示提醒所有人 */
  mentioned_mobile_list?: string[]
}

// 企业微信应用渠道配置
export interface WecomAppConfig {
  corpId: string
  agentId: string
  secret: string
}

// Telegram 渠道配置
export interface TelegramConfig {
  botToken: string
  chatId: string
}

// Discord 渠道配置
export interface DiscordConfig {
  webhook: string
}

// Webhook 渠道配置
export interface WebhookConfig {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
}

// 邮件渠道配置
export interface EmailConfig {
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
  }
  from: string
  to: string[]
}

// Bark 渠道配置
export interface BarkConfig {
  serverUrl: string
  deviceKey: string
}

// 联合类型：根据不同渠道类型使用不同的配置
export type ChannelConfig =
  | FeishuConfig
  | DingtalkConfig
  | WecomConfig
  | WecomAppConfig
  | TelegramConfig
  | DiscordConfig
  | WebhookConfig
  | EmailConfig
  | BarkConfig

// Channel model type (matching DB schema)
export interface Channel {
  id: string
  name: string
  type: ChannelType
  config: ChannelConfig | null
  status: 'active' | 'inactive'
  userId: string
  createdAt: Date
  updatedAt: Date
}

// DTOs for API
export interface CreateChannelDto {
  name: string
  type: ChannelType
  config: ChannelConfig
  status?: 'active' | 'inactive'
}

export interface UpdateChannelDto {
  name?: string
  type?: ChannelType
  config?: ChannelConfig
  status?: 'active' | 'inactive'
}
