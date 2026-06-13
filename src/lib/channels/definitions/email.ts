import { z } from 'zod/v4'
import type { ConfigFieldDef } from '../types'

export const emailConfigSchema = z.intersection(
  z.object({
    provider: z.enum(['smtp', 'resend']).default('smtp'),
    from: z.string().min(1, '请输入发件人地址'),
    to: z.string().min(1, '请输入收件人地址')
  }),
  z.union([
    z.object({
      provider: z.literal('smtp'),
      smtp: z.object({
        host: z.string().min(1, '请输入 SMTP 主机'),
        port: z.number().int().min(1).max(65535).default(465),
        secure: z.boolean().default(true),
        user: z.string().min(1, '请输入 SMTP 用户名'),
        password: z.string().min(1, '请输入 SMTP 密码')
      })
    }),
    z.object({
      provider: z.literal('resend'),
      resend: z.object({
        apiKey: z.string().min(1, '请输入 Resend API Key')
      })
    })
  ])
)

export type EmailConfig = z.infer<typeof emailConfigSchema>

// 邮件表单完全自定义，不由 configFields 驱动
export const emailConfigFields: ConfigFieldDef[] = []
