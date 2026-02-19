import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { updateEndpointSchema } from '@/lib/endpoints/validation'

export const Route = createFileRoute('/api/endpoints/$id')({
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
            id: endpoints.id,
            name: endpoints.name,
            token: endpoints.token,
            enabled: endpoints.enabled,
            channelId: endpoints.channelId,
            messageTemplate: endpoints.messageTemplate,
            messageType: endpoints.messageType,
            mentionedUserIds: endpoints.mentionedUserIds,
            mentionedMobiles: endpoints.mentionedMobiles,
            createdAt: endpoints.createdAt,
            updatedAt: endpoints.updatedAt,
            channelName: channels.name,
            channelType: channels.type
          })
          .from(endpoints)
          .innerJoin(channels, eq(endpoints.channelId, channels.id))
          .where(
            and(
              eq(endpoints.id, params.id),
              eq(endpoints.userId, session.user.id)
            )
          )

        if (!result.length) {
          return errorResponse('NOT_FOUND', '端点不存在', 404)
        }

        return jsonResponse(result[0])
      },

      PATCH: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = updateEndpointSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const [existing] = await db
          .select()
          .from(endpoints)
          .where(
            and(
              eq(endpoints.id, params.id),
              eq(endpoints.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', '端点不存在', 404)
        }

        // 如果更新了 channelId，验证渠道归属
        if (parsed.data.channelId) {
          const [ch] = await db
            .select()
            .from(channels)
            .where(
              and(
                eq(channels.id, parsed.data.channelId),
                eq(channels.userId, session.user.id)
              )
            )
          if (!ch) {
            return errorResponse('NOT_FOUND', '渠道不存在', 404)
          }
        }

        const [updated] = await db
          .update(endpoints)
          .set(parsed.data)
          .where(eq(endpoints.id, params.id))
          .returning()

        return jsonResponse(updated)
      },

      DELETE: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const [existing] = await db
          .select()
          .from(endpoints)
          .where(
            and(
              eq(endpoints.id, params.id),
              eq(endpoints.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', '端点不存在', 404)
        }

        await db.delete(endpoints).where(eq(endpoints.id, params.id))

        return jsonResponse(null, 204)
      }
    }
  }
})
