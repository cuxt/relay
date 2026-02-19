import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { createEndpointSchema } from '@/lib/endpoints/validation'
import { generateEndpointToken } from '@/lib/utils'

export const Route = createFileRoute('/api/endpoints/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const list = await db
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
            channelType: channels.type,
            channelEnabled: channels.enabled
          })
          .from(endpoints)
          .innerJoin(channels, eq(endpoints.channelId, channels.id))
          .where(eq(endpoints.userId, session.user.id))
          .orderBy(endpoints.createdAt)

        return jsonResponse(list)
      },

      POST: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = createEndpointSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        // 验证渠道归属
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

        const [created] = await db
          .insert(endpoints)
          .values({
            ...parsed.data,
            token: generateEndpointToken(),
            userId: session.user.id
          })
          .returning()

        return jsonResponse(created, 201)
      }
    }
  }
})
