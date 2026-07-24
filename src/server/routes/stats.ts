import { Elysia, t } from 'elysia'
import { eq, and, count, gte, sql, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pushLogs } from '@/lib/db/schema/push-logs'
import { endpoints } from '@/lib/db/schema/endpoints'
import { channels } from '@/lib/db/schema/channels'
import { requireLogin } from '@/server/guards'

/**
 * 统计 API（GET /api/stats, GET /api/stats/chart）。
 * 从 relay 的 TanStack API Routes 迁移而来；查询逻辑原样保留，鉴权改用 requireLogin macro。
 */
export const statsRoutes = new Elysia({ name: 'stats' })
  .use(requireLogin)
  .get(
    '/api/stats',
    async ({ session }) => {
      const userId = session.user.id
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [{ total }] = await db
        .select({ total: count() })
        .from(pushLogs)
        .where(eq(pushLogs.userId, userId))

      const [{ success }] = await db
        .select({ success: count() })
        .from(pushLogs)
        .where(and(eq(pushLogs.userId, userId), eq(pushLogs.status, 'success')))

      const [{ todayCount }] = await db
        .select({ todayCount: count() })
        .from(pushLogs)
        .where(and(eq(pushLogs.userId, userId), gte(pushLogs.createdAt, today)))

      const [{ activeEndpoints }] = await db
        .select({ activeEndpoints: count() })
        .from(endpoints)
        .where(and(eq(endpoints.userId, userId), eq(endpoints.enabled, true)))

      const successRate = total > 0 ? Math.round((success / total) * 100) : 0

      return {
        totalPushes: total,
        successRate,
        todayPushes: todayCount,
        activeEndpoints,
      }
    },
    {
      requireLogin: true,
      detail: { tags: ['统计'], summary: '获取概览统计数据' },
      response: {
        200: t.Object({
          totalPushes: t.Number(),
          successRate: t.Number(),
          todayPushes: t.Number(),
          activeEndpoints: t.Number(),
        }),
      },
    }
  )
  .get(
    '/api/stats/chart',
    async ({ session, query }) => {
      const range = query.range ?? '7d'
      const days = range === '90d' ? 90 : range === '30d' ? 30 : 7

      const since = new Date()
      since.setDate(since.getDate() - days)
      since.setHours(0, 0, 0, 0)

      const trend = await db
        .select({
          date: sql<string>`DATE(${pushLogs.createdAt})`.as('date'),
          total: count().as('total'),
          success:
            sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'success' THEN 1 END)`
              .mapWith(Number)
              .as('success'),
          failed: sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'failed' THEN 1 END)`
            .mapWith(Number)
            .as('failed'),
        })
        .from(pushLogs)
        .where(and(eq(pushLogs.userId, session.user.id), gte(pushLogs.createdAt, since)))
        .groupBy(sql`DATE(${pushLogs.createdAt})`)
        .orderBy(sql`DATE(${pushLogs.createdAt})`)

      const distribution = await db
        .select({ type: channels.type, count: count() })
        .from(pushLogs)
        .innerJoin(channels, eq(pushLogs.channelId, channels.id))
        .where(and(eq(pushLogs.userId, session.user.id), gte(pushLogs.createdAt, since)))
        .groupBy(channels.type)

      const endpointRanking = await db
        .select({
          name: endpoints.name,
          total: count().as('total'),
          success:
            sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'success' THEN 1 END)`
              .mapWith(Number)
              .as('success'),
          failed: sql<number>`COUNT(CASE WHEN ${pushLogs.status} = 'failed' THEN 1 END)`
            .mapWith(Number)
            .as('failed'),
        })
        .from(pushLogs)
        .innerJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
        .where(and(eq(pushLogs.userId, session.user.id), gte(pushLogs.createdAt, since)))
        .groupBy(endpoints.id, endpoints.name)
        .orderBy(desc(count()))
        .limit(10)

      return { trend, distribution, endpointRanking }
    },
    {
      requireLogin: true,
      query: t.Object({
        range: t.Optional(t.Union([t.Literal('7d'), t.Literal('30d'), t.Literal('90d')])),
      }),
      detail: { tags: ['统计'], summary: '获取图表数据（按天趋势/渠道分布/端点排行）' },
      response: {
        200: t.Object({
          trend: t.Array(
            t.Object({
              date: t.String(),
              total: t.Number(),
              success: t.Number(),
              failed: t.Number(),
            })
          ),
          distribution: t.Array(
            t.Object({ type: t.String(), count: t.Number() })
          ),
          endpointRanking: t.Array(
            t.Object({
              name: t.String(),
              total: t.Number(),
              success: t.Number(),
              failed: t.Number(),
            })
          ),
        }),
      },
    }
  )
