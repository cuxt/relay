import {
  boolean,
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { user } from './auth'

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

    config: json('config').$type<Record<string, unknown>>().notNull().default({}),

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
