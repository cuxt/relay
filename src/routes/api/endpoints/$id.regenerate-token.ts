import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { generateEndpointToken } from '@/lib/utils'

export const Route = createFileRoute('/api/endpoints/$id/regenerate-token')({
  server: {
    handlers: {
      POST: async ({
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

        const newToken = generateEndpointToken()
        const [updated] = await db
          .update(endpoints)
          .set({ token: newToken })
          .where(eq(endpoints.id, params.id))
          .returning()

        return jsonResponse({ token: updated.token })
      }
    }
  }
})
