import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { aiProviders } from './ai-providers'

export const aiPresets = pgTable(
  'ai_presets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    key: text('key').notNull(),
    providerId: text('provider_id')
      .notNull()
      .references(() => aiProviders.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    systemPrompt: text('system_prompt').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  table => [
    index('ai_presets_user_id_idx').on(table.userId),
    index('ai_presets_provider_id_idx').on(table.providerId),
    uniqueIndex('ai_presets_user_key_idx').on(table.userId, table.key)
  ]
)
