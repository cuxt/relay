import { z } from 'zod/v4'

const stringList = z.array(z.string().min(1)).min(1)
const emailList = z.array(z.email()).min(1)

export const feishuParamsSchema = z.object({
  format: z.enum(['text', 'markdown']).optional(),
  title: z.string().min(1).optional(),
})

export const wecomParamsSchema = z.object({
  format: z.enum(['text', 'markdown']).optional(),
  mentionedUserIds: z.array(z.string().min(1)).optional(),
  mentionedMobiles: z.array(z.string().min(1)).optional(),
})

export const wecomAppParamsSchema = z.object({
  format: z.enum(['text', 'markdown']).optional(),
  toUser: stringList.optional(),
  toParty: stringList.optional(),
  toTag: stringList.optional(),
})

export const dingtalkParamsSchema = z.object({
  format: z.enum(['text', 'markdown']).optional(),
  title: z.string().min(1).optional(),
  atMobiles: z.array(z.string().min(1)).optional(),
  atUserIds: z.array(z.string().min(1)).optional(),
  isAtAll: z.boolean().optional(),
})

export const telegramParamsSchema = z.object({
  chatId: z.union([z.string().min(1), z.number()]).optional(),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional(),
  disableWebPagePreview: z.boolean().optional(),
})

export const discordParamsSchema = z.object({
  username: z.string().min(1).optional(),
  avatarUrl: z.url().optional(),
  tts: z.boolean().optional(),
})

export const webhookParamsSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const emailParamsSchema = z.object({
  from: z.string().min(1).optional(),
  to: emailList.optional(),
  cc: emailList.optional(),
  bcc: emailList.optional(),
  replyTo: z.email().optional(),
  subject: z.string().min(1).optional(),
  format: z.enum(['text', 'markdown']).optional(),
})

export const barkParamsSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  group: z.string().min(1).optional(),
  sound: z.string().min(1).optional(),
  url: z.url().optional(),
  level: z.enum(['active', 'timeSensitive', 'passive', 'critical']).optional(),
})

export type FeishuParams = z.infer<typeof feishuParamsSchema>
export type WecomParams = z.infer<typeof wecomParamsSchema>
export type WecomAppParams = z.infer<typeof wecomAppParamsSchema>
export type DingtalkParams = z.infer<typeof dingtalkParamsSchema>
export type TelegramParams = z.infer<typeof telegramParamsSchema>
export type DiscordParams = z.infer<typeof discordParamsSchema>
export type WebhookParams = z.infer<typeof webhookParamsSchema>
export type EmailParams = z.infer<typeof emailParamsSchema>
export type BarkParams = z.infer<typeof barkParamsSchema>

export const channelRequestExamples = {
  feishu: { format: 'markdown', title: '发布通知' },
  wecom: { format: 'text', mentionedUserIds: ['@all'] },
  wecom_app: { format: 'markdown', toUser: ['zhangsan'] },
  dingtalk: { format: 'markdown', title: '告警通知', isAtAll: false },
  telegram: { chatId: '-1001234567890', parseMode: 'MarkdownV2' },
  discord: { username: 'Relay', tts: false },
  webhook: { headers: { 'X-Source': 'relay' }, data: { event: 'notification' } },
  email: {
    from: 'Relay <notify@example.com>',
    to: ['user@example.com'],
    subject: 'Relay 通知',
    format: 'markdown',
  },
  bark: { title: 'Relay 通知', group: 'relay' },
} as const
