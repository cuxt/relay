import type { channelTypeEnum } from '@/db/schemas/channels.schema'

export type ChannelType = (typeof channelTypeEnum.enumValues)[number]

export const CHANNEL_TYPES: Record<
  ChannelType,
  { label: string; color: string }
> = {
  feishu: { label: '飞书', color: '#3370ff' },
  wecom: { label: '企微 Webhook', color: '#07c160' },
  wecom_app: { label: '企微应用', color: '#07c160' },
  dingtalk: { label: '钉钉', color: '#0089ff' },
  telegram: { label: 'Telegram', color: '#26a5e4' },
  discord: { label: 'Discord', color: '#5865f2' },
  webhook: { label: '自定义 Webhook', color: '#6366f1' },
  email: { label: '邮件', color: '#ea580c' },
  bark: { label: 'Bark', color: '#f59e0b' }
}

export const CHANNEL_TYPE_LIST = Object.entries(CHANNEL_TYPES).map(
  ([value, meta]) => ({
    value: value as ChannelType,
    ...meta
  })
)
