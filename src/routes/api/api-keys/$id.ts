import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { apiKeys } from '@/db/schemas/api-keys.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/api-keys/$id')({
  server: {
    handlers: {
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
          .from(apiKeys)
          .where(
            and(eq(apiKeys.id, params.id), eq(apiKeys.userId, session.user.id))
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', 'API 密钥不存在', 404)
        }

        await db.delete(apiKeys).where(eq(apiKeys.id, params.id))

        return jsonResponse(null, 204)
      }
    }
  }
})
