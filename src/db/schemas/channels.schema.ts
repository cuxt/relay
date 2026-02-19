import {
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { user } from './auth.schema'

export const channelTypeEnum = pgEnum('channel_type', [
  'feishu',
  'wecom',
  'wecom_app',
  'dingtalk',
  'telegram',
  'discord',
  'webhook',
  'email',
  'bark'
])

export const channels = pgTable(
  'channels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    type: channelTypeEnum('type').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // 通用字段
    webhookUrl: text('webhook_url'),
    secret: text('secret'),

    // Telegram
    botToken: text('bot_token'),
    chatId: text('chat_id'),

    // 企微应用
    corpId: text('corp_id'),
    agentId: text('agent_id'),
    appSecret: text('app_secret'),

    // Email SMTP
    smtpHost: text('smtp_host'),
    smtpPort: integer('smtp_port'),
    smtpSecure: boolean('smtp_secure'),
    smtpUser: text('smtp_user'),
    smtpPassword: text('smtp_password'),
    emailFrom: text('email_from'),
    emailTo: text('email_to'),

    // Email Resend
    emailProvider: text('email_provider'), // 'smtp' | 'resend'
    resendApiKey: text('resend_api_key'),

    // Bark
    barkServerUrl: text('bark_server_url'),
    barkDeviceKey: text('bark_device_key'),

    // 通用 Webhook
    webhookMethod: text('webhook_method'),
    webhookHeaders: json('webhook_headers').$type<Record<string, string>>(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  table => [
    index('channels_user_id_idx').on(table.userId),
    index('channels_type_idx').on(table.type)
  ]
)
