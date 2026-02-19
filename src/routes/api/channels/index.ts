import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { channels } from '@/db/schemas/channels.schema'
import { eq } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { createChannelSchema } from '@/lib/channels/validation'

export const Route = createFileRoute('/api/channels/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const list = await db
          .select()
          .from(channels)
          .where(eq(channels.userId, session.user.id))
          .orderBy(channels.createdAt)

        return jsonResponse(list)
      },

      POST: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = createChannelSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const data = parsed.data
        const [created] = await db
          .insert(channels)
          .values({
            ...data,
            userId: session.user.id
          })
          .returning()

        return jsonResponse(created, 201)
      }
    }
  }
})
