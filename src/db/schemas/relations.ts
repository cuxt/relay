import { relations } from 'drizzle-orm'
import { user, session, account } from './auth.schema'
import { channels } from './channels.schema'
import { endpoints } from './endpoints.schema'
import { pushLogs } from './push-logs.schema'
import { apiKeys } from './api-keys.schema'
import { aiProviders } from './ai-providers.schema'
import { aiPresets } from './ai-presets.schema'

// Auth relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  channels: many(channels),
  endpoints: many(endpoints),
  pushLogs: many(pushLogs),
  apiKeys: many(apiKeys),
  aiProviders: many(aiProviders),
  aiPresets: many(aiPresets)
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}))

// Channel relations
export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(user, {
    fields: [channels.userId],
    references: [user.id]
  }),
  endpoints: many(endpoints),
  pushLogs: many(pushLogs)
}))

// Endpoint relations
export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  user: one(user, {
    fields: [endpoints.userId],
    references: [user.id]
  }),
  channel: one(channels, {
    fields: [endpoints.channelId],
    references: [channels.id]
  }),
  pushLogs: many(pushLogs)
}))

// Push log relations
export const pushLogsRelations = relations(pushLogs, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [pushLogs.endpointId],
    references: [endpoints.id]
  }),
  channel: one(channels, {
    fields: [pushLogs.channelId],
    references: [channels.id]
  }),
  user: one(user, {
    fields: [pushLogs.userId],
    references: [user.id]
  })
}))

// API key relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(user, {
    fields: [apiKeys.userId],
    references: [user.id]
  })
}))

// AI Provider relations
export const aiProvidersRelations = relations(aiProviders, ({ one, many }) => ({
  user: one(user, {
    fields: [aiProviders.userId],
    references: [user.id]
  }),
  presets: many(aiPresets)
}))

// AI Preset relations
export const aiPresetsRelations = relations(aiPresets, ({ one }) => ({
  user: one(user, {
    fields: [aiPresets.userId],
    references: [user.id]
  }),
  provider: one(aiProviders, {
    fields: [aiPresets.providerId],
    references: [aiProviders.id]
  })
}))
