import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { eq, and, count, gte } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/stats/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const userId = session.user.id
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 总推送数
        const [{ total }] = await db
          .select({ total: count() })
          .from(pushLogs)
          .where(eq(pushLogs.userId, userId))

        // 成功数
        const [{ success }] = await db
          .select({ success: count() })
          .from(pushLogs)
          .where(
            and(eq(pushLogs.userId, userId), eq(pushLogs.status, 'success'))
          )

        // 今日推送
        const [{ todayCount }] = await db
          .select({ todayCount: count() })
          .from(pushLogs)
          .where(
            and(eq(pushLogs.userId, userId), gte(pushLogs.createdAt, today))
          )

        // 活跃端点数
        const [{ activeEndpoints }] = await db
          .select({ activeEndpoints: count() })
          .from(endpoints)
          .where(and(eq(endpoints.userId, userId), eq(endpoints.enabled, true)))

        const successRate = total > 0 ? Math.round((success / total) * 100) : 0

        return jsonResponse({
          totalPushes: total,
          successRate,
          todayPushes: todayCount,
          activeEndpoints
        })
      }
    }
  }
})
