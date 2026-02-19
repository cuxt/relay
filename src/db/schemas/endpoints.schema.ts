import {
  boolean,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { user } from './auth.schema'
import { channels } from './channels.schema'

export const endpoints = pgTable(
  'endpoints',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    token: text('token').notNull().unique(),
    enabled: boolean('enabled').notNull().default(true),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),

    messageTemplate: text('message_template'),
    messageType: text('message_type').default('text'),
    mentionedUserIds: text('mentioned_user_ids'), // 逗号分隔
    mentionedMobiles: text('mentioned_mobiles'), // 逗号分隔

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  table => [
    index('endpoints_user_id_idx').on(table.userId),
    index('endpoints_channel_id_idx').on(table.channelId),
    index('endpoints_token_idx').on(table.token)
  ]
)
