import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { channels } from '@/db/schemas/channels.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { updateChannelSchema } from '@/lib/channels/validation'
import { getChannelMeta } from '@/lib/channels/registry'
import type { ChannelType } from '@/lib/channels/registry'

export const Route = createFileRoute('/api/channels/$id')({
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

        const [channel] = await db
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.id, params.id),
              eq(channels.userId, session.user.id)
            )
          )

        if (!channel) {
          return errorResponse('NOT_FOUND', '渠道不存在', 404)
        }

        return jsonResponse(channel)
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
        const parsed = updateChannelSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const [existing] = await db
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.id, params.id),
              eq(channels.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', '渠道不存在', 404)
        }

        // 按 type 校验 config
        if (parsed.data.config) {
          const meta = getChannelMeta(existing.type as ChannelType)
          const configParsed = meta.configSchema.safeParse(parsed.data.config)
          if (!configParsed.success) {
            return errorResponse(
              'VALIDATION_ERROR',
              configParsed.error.issues.map(i => i.message).join(', '),
              400
            )
          }
        }

        const [updated] = await db
          .update(channels)
          .set(parsed.data)
          .where(eq(channels.id, params.id))
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
          .from(channels)
          .where(
            and(
              eq(channels.id, params.id),
              eq(channels.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', '渠道不存在', 404)
        }

        await db.delete(channels).where(eq(channels.id, params.id))

        return jsonResponse(null, 204)
      }
    }
  }
})
