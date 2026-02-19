import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { eq, and, desc, count, like, gte } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/logs/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const url = new URL(request.url)
        const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
        const limit = Math.min(
          100,
          Math.max(1, Number(url.searchParams.get('limit') || '20'))
        )
        const status = url.searchParams.get('status')
        const channelType = url.searchParams.get('channelType')
        const endpointId = url.searchParams.get('endpointId')
        const search = url.searchParams.get('search')
        const startDate = url.searchParams.get('startDate')

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

        return jsonResponse({
          items: logs,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        })
      }
    }
  }
})
