import { relations } from 'drizzle-orm'
import { user } from './auth'
import { channels } from './channels'
import { endpointChannels, endpoints } from './endpoints'
import { pushLogs } from './push-logs'
import { aiProviders } from './ai-providers'
import { aiPresets } from './ai-presets'

// 业务表之间的关系（user → 业务表的 many 关系定义在 auth.ts 的 userRelations，
// 此处不重复定义 user relations，避免覆盖 auth.ts）

export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(user, {
    fields: [channels.userId],
    references: [user.id],
  }),
  endpointChannels: many(endpointChannels),
  pushLogs: many(pushLogs),
}))

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  user: one(user, {
    fields: [endpoints.userId],
    references: [user.id],
  }),
  endpointChannels: many(endpointChannels),
  pushLogs: many(pushLogs),
}))

export const endpointChannelsRelations = relations(endpointChannels, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [endpointChannels.endpointId],
    references: [endpoints.id],
  }),
  channel: one(channels, {
    fields: [endpointChannels.channelId],
    references: [channels.id],
  }),
}))

export const pushLogsRelations = relations(pushLogs, ({ one }) => ({
  endpoint: one(endpoints, {
    fields: [pushLogs.endpointId],
    references: [endpoints.id],
  }),
  channel: one(channels, {
    fields: [pushLogs.channelId],
    references: [channels.id],
  }),
  user: one(user, {
    fields: [pushLogs.userId],
    references: [user.id],
  }),
}))

export const aiProvidersRelations = relations(aiProviders, ({ one, many }) => ({
  user: one(user, {
    fields: [aiProviders.userId],
    references: [user.id],
  }),
  presets: many(aiPresets),
}))

export const aiPresetsRelations = relations(aiPresets, ({ one }) => ({
  user: one(user, {
    fields: [aiPresets.userId],
    references: [user.id],
  }),
  provider: one(aiProviders, {
    fields: [aiPresets.providerId],
    references: [aiProviders.id],
  }),
}))
