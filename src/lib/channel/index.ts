// 渠道类型常量
export const CHANNEL_TYPES = {
  EMAIL: 'email',
  WEBHOOK: 'webhook',
  DINGTALK: 'dingtalk',
  WECOM: 'wecom',
  WECOM_APP: 'wecom_app',
  TELEGRAM: 'telegram',
  FEISHU: 'feishu',
  DISCORD: 'discord',
  BARK: 'bark'
} as const

export type ChannelType = (typeof CHANNEL_TYPES)[keyof typeof CHANNEL_TYPES]
