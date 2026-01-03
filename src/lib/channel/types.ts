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
