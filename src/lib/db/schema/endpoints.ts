import { boolean, index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { channels } from './channels'

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
    messageTemplate: text('message_template'),
    messageType: text('message_type').default('text'),
    mentionedUserIds: text('mentioned_user_ids'), // 逗号分隔
    mentionedMobiles: text('mentioned_mobiles'), // 逗号分隔

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('endpoints_user_id_idx').on(table.userId),
    index('endpoints_token_idx').on(table.token),
  ]
)

export const endpointChannels = pgTable(
  'endpoint_channels',
  {
    endpointId: text('endpoint_id')
      .notNull()
      .references(() => endpoints.id, { onDelete: 'cascade' }),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.endpointId, table.channelId] }),
    index('endpoint_channels_channel_id_idx').on(table.channelId),
  ]
)
