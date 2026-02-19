import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/logs/$id')({
  server: {
    handlers: {
      GET: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

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
            createdAt: pushLogs.createdAt,
            endpointName: endpoints.name,
            channelName: channels.name,
            channelType: channels.type
          })
          .from(pushLogs)
          .leftJoin(endpoints, eq(pushLogs.endpointId, endpoints.id))
          .leftJoin(channels, eq(pushLogs.channelId, channels.id))
          .where(
            and(
              eq(pushLogs.id, params.id),
              eq(pushLogs.userId, session.user.id)
            )
          )

        if (!result.length) {
          return errorResponse('NOT_FOUND', '日志不存在', 404)
        }

        return jsonResponse(result[0])
      }
    }
  }
})
