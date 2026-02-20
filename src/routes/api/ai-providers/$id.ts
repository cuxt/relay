import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiProviders } from '@/db/schemas/ai-providers.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { updateAiProviderSchema } from '@/lib/ai/validation'

export const Route = createFileRoute('/api/ai-providers/$id')({
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

        const [provider] = await db
          .select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.id, params.id),
              eq(aiProviders.userId, session.user.id)
            )
          )

        if (!provider) {
          return errorResponse('NOT_FOUND', 'AI 服务不存在', 404)
        }

        return jsonResponse(provider)
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
        const parsed = updateAiProviderSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const [existing] = await db
          .select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.id, params.id),
              eq(aiProviders.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', 'AI 服务不存在', 404)
        }

        const [updated] = await db
          .update(aiProviders)
          .set(parsed.data)
          .where(eq(aiProviders.id, params.id))
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
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.id, params.id),
              eq(aiProviders.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', 'AI 服务不存在', 404)
        }

        await db.delete(aiProviders).where(eq(aiProviders.id, params.id))

        return jsonResponse(null, 204)
      }
    }
  }
})
