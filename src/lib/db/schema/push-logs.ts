import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { channels } from './channels'
import { endpoints } from './endpoints'

export const pushLogStatusEnum = pgEnum('push_log_status', [
  'success',
  'failed',
  'pending'
])

export const pushLogs = pgTable(
  'push_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    endpointId: text('endpoint_id')
      .notNull()
      .references(() => endpoints.id, { onDelete: 'cascade' }),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // 请求信息
    requestBody: text('request_body'),
    requestIp: text('request_ip'),
    requestUserAgent: text('request_user_agent'),

    // 处理结果
    resolvedMessage: text('resolved_message'),
    status: pushLogStatusEnum('status').notNull().default('pending'),
    responseBody: text('response_body'),
    responseStatus: integer('response_status'),
    errorMessage: text('error_message'),

    // 性能
    latencyMs: integer('latency_ms'),

    // AI 处理
    aiPresetId: text('ai_preset_id'),
    aiProcessedMessage: text('ai_processed_message'),
    aiLatencyMs: integer('ai_latency_ms'),
    aiError: text('ai_error'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  table => [
    index('push_logs_endpoint_id_idx').on(table.endpointId),
    index('push_logs_channel_id_idx').on(table.channelId),
    index('push_logs_user_id_idx').on(table.userId),
    index('push_logs_status_idx').on(table.status),
    index('push_logs_created_at_idx').on(table.createdAt)
  ]
)
