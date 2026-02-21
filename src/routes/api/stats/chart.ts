import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { channels } from '@/db/schemas/channels.schema'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { eq, and, gte, sql, count, desc } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/stats/chart')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const url = new URL(request.url)
        const range = url.searchParams.get('range') || '7d'
        const days = range === '90d' ? 90 : range === '30d' ? 30 : 7

        const since = new Date()
        since.setDate(since.getDate() - days)
        since.setHours(0, 0, 0, 0)

        // 按天分组的推送趋势
        const trend = await db
          .select({
            date: sql<string>`DATE(${pushLogs.createdAt})`.as('date'),
            total: count().as('total'),
            success:
              sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'success' THEN 1 END)`.as(
                'success'
              ),
            failed:
              sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'failed' THEN 1 END)`.as(
                'failed'
              )
          })
          .from(pushLogs)
          .where(
            and(
              eq(pushLogs.userId, session.user.id),
              gte(pushLogs.createdAt, since)
            )
          )
          .groupBy(sql`DATE(${pushLogs.createdAt})`)
          .orderBy(sql`DATE(${pushLogs.createdAt})`)

        // 渠道分布
        const distribution = await db
          .select({
            type: channels.type,
            count: count()
          })
          .from(pushLogs)
          .innerJoin(channels, eq(pushLogs.channelId, channels.id))
          .where(
            and(
              eq(pushLogs.userId, session.user.id),
              gte(pushLogs.createdAt, since)
            )
          )
          .groupBy(channels.type)

        // 端点调用排行
        const endpointRanking = await db
          .select({
            name: endpoints.name,
            total: count().as('total'),
            success:
              sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'success' THEN 1 END)`.as(
                'success'
              ),
            failed:
              sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'failed' THEN 1 END)`.as(
                'failed'
              )
          })
          .from(pushLogs)
          .innerJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
          .where(
            and(
              eq(pushLogs.userId, session.user.id),
              gte(pushLogs.createdAt, since)
            )
          )
          .groupBy(endpoints.id, endpoints.name)
          .orderBy(desc(count()))
          .limit(10)

        return jsonResponse({ trend, distribution, endpointRanking })
      }
    }
  }
})
