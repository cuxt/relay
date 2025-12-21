import { index, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { ChannelType } from '@/lib/channel'
import { user } from './auth.schema'

export const channel = pgTable(
  'channel',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull().$type<ChannelType>(),
    config: json('config'),
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  table => [index('channel_userId_idx').on(table.userId)]
)
