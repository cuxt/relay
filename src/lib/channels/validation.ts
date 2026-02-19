import { z } from 'zod/v4'

const baseSchema = z.object({
  name: z.string().min(1, '请输入渠道名称').max(50, '名称不能超过 50 个字符'),
  enabled: z.boolean().default(true)
})

// 飞书
export const feishuSchema = baseSchema.extend({
  type: z.literal('feishu'),
  webhookUrl: z.url('请输入有效的 Webhook 地址'),
  secret: z.string().optional()
})

// 企微 Webhook
export const wecomSchema = baseSchema.extend({
  type: z.literal('wecom'),
  webhookUrl: z.url('请输入有效的 Webhook 地址')
})

// 企微应用
export const wecomAppSchema = baseSchema.extend({
  type: z.literal('wecom_app'),
  corpId: z.string().min(1, '请输入 Corp ID'),
  agentId: z.string().min(1, '请输入 Agent ID'),
  appSecret: z.string().min(1, '请输入 App Secret')
})

// 钉钉
export const dingtalkSchema = baseSchema.extend({
  type: z.literal('dingtalk'),
  webhookUrl: z.url('请输入有效的 Webhook 地址'),
  secret: z.string().optional()
})

// Telegram
export const telegramSchema = baseSchema.extend({
  type: z.literal('telegram'),
  botToken: z.string().min(1, '请输入 Bot Token'),
  chatId: z.string().min(1, '请输入 Chat ID')
})

// Discord
export const discordSchema = baseSchema.extend({
  type: z.literal('discord'),
  webhookUrl: z.url('请输入有效的 Webhook 地址')
})

// 通用 Webhook
export const webhookSchema = baseSchema.extend({
  type: z.literal('webhook'),
  webhookUrl: z.url('请输入有效的 Webhook 地址'),
  webhookMethod: z.enum(['GET', 'POST']).default('POST'),
  webhookHeaders: z.record(z.string(), z.string()).optional()
})

// Email
export const emailSchema = baseSchema.extend({
  type: z.literal('email'),
  emailProvider: z.enum(['smtp', 'resend']).default('smtp'),
  emailFrom: z.string().min(1, '请输入发件人地址'),
  emailTo: z.string().min(1, '请输入收件人地址'),
  // SMTP 字段（provider=smtp 时必填）
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  // Resend 字段（provider=resend 时必填）
  resendApiKey: z.string().optional()
})

// Bark
export const barkSchema = baseSchema.extend({
  type: z.literal('bark'),
  barkServerUrl: z.url('请输入有效的 Bark 服务器地址'),
  barkDeviceKey: z.string().min(1, '请输入设备密钥')
})

export const createChannelSchema = z.discriminatedUnion('type', [
  feishuSchema,
  wecomSchema,
  wecomAppSchema,
  dingtalkSchema,
  telegramSchema,
  discordSchema,
  webhookSchema,
  emailSchema,
  barkSchema
])

export type CreateChannelInput = z.infer<typeof createChannelSchema>

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  enabled: z.boolean().optional(),
  webhookUrl: z.string().optional(),
  secret: z.string().optional(),
  botToken: z.string().optional(),
  chatId: z.string().optional(),
  corpId: z.string().optional(),
  agentId: z.string().optional(),
  appSecret: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  emailFrom: z.string().optional(),
  emailTo: z.string().optional(),
  emailProvider: z.enum(['smtp', 'resend']).optional(),
  resendApiKey: z.string().optional(),
  barkServerUrl: z.string().optional(),
  barkDeviceKey: z.string().optional(),
  webhookMethod: z.enum(['GET', 'POST']).optional(),
  webhookHeaders: z.record(z.string(), z.string()).optional()
})

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>
