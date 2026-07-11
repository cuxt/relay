import { t } from 'elysia'

/** 邮件配置在 config KV 表中的 key */
export const EMAIL_CONFIG_KEY = 'email_config'

/** 邮件配置 TypeBox schema（运行时校验 + 类型 + OpenAPI 的单一来源） */
export const EmailConfigSchema = t.Object({
  transport: t.Union([t.Literal('smtp'), t.Literal('resend')]),
  from: t.String(),
  /** SMTP */
  host: t.Optional(t.String()),
  port: t.Optional(t.Number()),
  secure: t.Optional(t.Boolean()),
  username: t.Optional(t.String()),
  password: t.Optional(t.String()),
  /** Resend */
  apiKey: t.Optional(t.String()),
})

/** 邮件传输方式 */
export type EmailTransport = typeof EmailConfigSchema.properties.transport.static

/** 邮件配置（存于 config 表，value 为该对象的 JSON） */
export type EmailConfig = typeof EmailConfigSchema.static
