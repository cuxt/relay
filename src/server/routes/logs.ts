import { Elysia, t } from 'elysia'
import { eq, and, desc, count, like, gte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pushLogs } from '@/lib/db/schema/push-logs'
import { endpoints } from '@/lib/db/schema/endpoints'
import { channels } from '@/lib/db/schema/channels'
import { requireLogin } from '@/server/guards'

/**
 * 推送日志 API（列表带筛选/分页 + 单条详情）。
 * 从 relay 的 TanStack API Routes 迁移而来；查询逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例。
 */
export const logRoutes = new Elysia({ name: 'logs' })
  .use(requireLogin)
  .get(
    '/api/logs',
    async ({ session, query }) => {
      const page = Math.max(1, Number(query.page || '1'))
      const limit = Math.min(
        100,
        Math.max(1, Number(query.limit || '20'))
      )
      const status = query.status
      const channelType = query.channelType
      const endpointId = query.endpointId
      const search = query.search
      const startDate = query.startDate

      const conditions = [eq(pushLogs.userId, session.user.id)]

      if (status) {
        conditions.push(eq(pushLogs.status, status as any))
      }
      if (channelType) {
        conditions.push(eq(channels.type, channelType as any))
      }
      if (endpointId) {
        conditions.push(eq(pushLogs.endpointId, endpointId))
      }
      if (startDate) {
        conditions.push(gte(pushLogs.createdAt, new Date(startDate)))
      }

      // search 只搜索消息内容
      const whereClause = and(...conditions)
      const searchClause = search
        ? and(whereClause, like(pushLogs.resolvedMessage, `%${search}%`))
        : whereClause

      // 获取总数
      const [{ total }] = await db
        .select({ total: count() })
        .from(pushLogs)
        .leftJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
        .leftJoin(channels, eq(pushLogs.channelId, channels.id))
        .where(searchClause)

      // 获取日志列表（关联端点和渠道信息）
      const logs = await db
        .select({
          id: pushLogs.id,
          endpointId: pushLogs.endpointId,
          channelId: pushLogs.channelId,
          status: pushLogs.status,
          resolvedMessage: pushLogs.resolvedMessage,
          responseStatus: pushLogs.responseStatus,
          errorMessage: pushLogs.errorMessage,
          latencyMs: pushLogs.latencyMs,
          requestIp: pushLogs.requestIp,
          createdAt: pushLogs.createdAt,
          endpointName: endpoints.name,
          channelName: channels.name,
          channelType: channels.type
        })
        .from(pushLogs)
        .leftJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
        .leftJoin(channels, eq(pushLogs.channelId, channels.id))
        .where(searchClause)
        .orderBy(desc(pushLogs.createdAt))
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        items: logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    },
    {
      requireLogin: true,
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        status: t.Optional(t.String()),
        channelType: t.Optional(t.String()),
        endpointId: t.Optional(t.String()),
        search: t.Optional(t.String()),
        startDate: t.Optional(t.String())
      }),
      detail: { tags: ['日志'], summary: '获取推送日志列表（分页+筛选）' }
    }
  )
  .get(
    '/api/logs/:id',
    async ({ session, params, status }) => {
      const result = await db
        .select({
          id: pushLogs.id,
          endpointId: pushLogs.endpointId,
          channelId: pushLogs.channelId,
          status: pushLogs.status,
          requestBody: pushLogs.requestBody,
          requestIp: pushLogs.requestIp,
          requestUserAgent: pushLogs.requestUserAgent,
          resolvedMessage: pushLogs.resolvedMessage,
          responseBody: pushLogs.responseBody,
          responseStatus: pushLogs.responseStatus,
          errorMessage: pushLogs.errorMessage,
          latencyMs: pushLogs.latencyMs,
          aiPresetId: pushLogs.aiPresetId,
          aiProcessedMessage: pushLogs.aiProcessedMessage,
          aiLatencyMs: pushLogs.aiLatencyMs,
          aiError: pushLogs.aiError,
          createdAt: pushLogs.createdAt,
          endpointName: endpoints.name,
          channelName: channels.name,
          channelType: channels.type
        })
        .from(pushLogs)
        .leftJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
        .leftJoin(channels, eq(pushLogs.channelId, channels.id))
        .where(
          and(eq(pushLogs.id, params.id), eq(pushLogs.userId, session.user.id))
        )

      if (!result.length) {
        return status(404, { error: '日志不存在' })
      }

      return result[0]
    },
    {
      requireLogin: true,
      detail: { tags: ['日志'], summary: '获取单条推送日志详情' }
    }
  )
