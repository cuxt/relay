import {
  boolean,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    key: text('key').notNull().unique(),
    enabled: boolean('enabled').notNull().default(true),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  table => [
    index('api_keys_user_id_idx').on(table.userId),
    index('api_keys_key_idx').on(table.key)
  ]
)
