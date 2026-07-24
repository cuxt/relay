import type { ChannelMeta } from './types'

// 仅导入客户端安全的元数据（configSchema + configFields + label + color）
import { feishuConfigSchema, feishuConfigFields } from './definitions/feishu'
import { wecomConfigSchema, wecomConfigFields } from './definitions/wecom'
import { wecomAppConfigSchema, wecomAppConfigFields } from './definitions/wecom-app'
import { dingtalkConfigSchema, dingtalkConfigFields } from './definitions/dingtalk'
import { telegramConfigSchema, telegramConfigFields } from './definitions/telegram'
import { discordConfigSchema, discordConfigFields } from './definitions/discord'
import { webhookConfigSchema, webhookConfigFields } from './definitions/webhook'
import { emailConfigSchema, emailConfigFields } from './definitions/email'
import { barkConfigSchema, barkConfigFields } from './definitions/bark'

import type { channelTypeEnum } from '@/lib/db/schema/channels'
import {
  barkParamsSchema,
  channelRequestExamples,
  dingtalkParamsSchema,
  discordParamsSchema,
  emailParamsSchema,
  feishuParamsSchema,
  telegramParamsSchema,
  webhookParamsSchema,
  wecomAppParamsSchema,
  wecomParamsSchema,
} from './request-params'

export type ChannelType = (typeof channelTypeEnum.enumValues)[number]

export const channelMeta: Record<ChannelType, ChannelMeta> = {
  feishu: {
    type: 'feishu',
    label: '飞书',
    color: '#3370ff',
    configSchema: feishuConfigSchema,
    configFields: feishuConfigFields,
    requestSchema: feishuParamsSchema,
    requestExample: channelRequestExamples.feishu,
  },
  wecom: {
    type: 'wecom',
    label: '企微 Webhook',
    color: '#07c160',
    configSchema: wecomConfigSchema,
    configFields: wecomConfigFields,
    requestSchema: wecomParamsSchema,
    requestExample: channelRequestExamples.wecom,
  },
  wecom_app: {
    type: 'wecom_app',
    label: '企微应用',
    color: '#07c160',
    configSchema: wecomAppConfigSchema,
    configFields: wecomAppConfigFields,
    requestSchema: wecomAppParamsSchema,
    requestExample: channelRequestExamples.wecom_app,
  },
  dingtalk: {
    type: 'dingtalk',
    label: '钉钉',
    color: '#0089ff',
    configSchema: dingtalkConfigSchema,
    configFields: dingtalkConfigFields,
    requestSchema: dingtalkParamsSchema,
    requestExample: channelRequestExamples.dingtalk,
  },
  telegram: {
    type: 'telegram',
    label: 'Telegram',
    color: '#26a5e4',
    configSchema: telegramConfigSchema,
    configFields: telegramConfigFields,
    requestSchema: telegramParamsSchema,
    requestExample: channelRequestExamples.telegram,
  },
  discord: {
    type: 'discord',
    label: 'Discord',
    color: '#5865f2',
    configSchema: discordConfigSchema,
    configFields: discordConfigFields,
    requestSchema: discordParamsSchema,
    requestExample: channelRequestExamples.discord,
  },
  webhook: {
    type: 'webhook',
    label: '自定义 Webhook',
    color: '#6366f1',
    configSchema: webhookConfigSchema,
    configFields: webhookConfigFields,
    requestSchema: webhookParamsSchema,
    requestExample: channelRequestExamples.webhook,
  },
  email: {
    type: 'email',
    label: '邮件',
    color: '#ea580c',
    configSchema: emailConfigSchema,
    configFields: emailConfigFields,
    requestSchema: emailParamsSchema,
    requestExample: channelRequestExamples.email,
  },
  bark: {
    type: 'bark',
    label: 'Bark',
    color: '#f59e0b',
    configSchema: barkConfigSchema,
    configFields: barkConfigFields,
    requestSchema: barkParamsSchema,
    requestExample: channelRequestExamples.bark,
  },
}

export function getChannelMeta<T extends ChannelType>(type: T): (typeof channelMeta)[T] {
  return channelMeta[type]
}

export function getAllMeta(): ReadonlyArray<ChannelMeta> {
  return Object.values(channelMeta)
}

/** 渠道元数据（label + color），替换原 constants.ts */
export const CHANNEL_META = Object.fromEntries(
  Object.entries(channelMeta).map(([type, meta]) => [
    type,
    { label: meta.label, color: meta.color },
  ])
) as Record<ChannelType, { label: string; color: string }>

export const CHANNEL_TYPE_LIST = Object.entries(channelMeta).map(([value, meta]) => ({
  value: value as ChannelType,
  label: meta.label,
  color: meta.color,
}))
