import { index, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth.schema'
import { channel } from './channel.schema'

export const endpoint = pgTable(
  'endpoint',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    config: json('config'),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    channelId: text('channel_id')
      .notNull()
      .references(() => channel.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  table => ({
    userIdIdx: [index('endpoint_userId_idx').on(table.userId)],
    channelIdIdx: [index('endpoint_channelId_idx').on(table.channelId)]
  })
)
