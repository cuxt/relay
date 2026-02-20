import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiProviders } from '@/db/schemas/ai-providers.schema'
import { eq } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { createAiProviderSchema } from '@/lib/ai/validation'

function maskApiKey(key: string): string {
  if (key.length <= 12) return '****'
  return key.slice(0, 8) + '****' + key.slice(-4)
}

export const Route = createFileRoute('/api/ai-providers/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const list = await db
          .select({
            id: aiProviders.id,
            name: aiProviders.name,
            baseUrl: aiProviders.baseUrl,
            apiKey: aiProviders.apiKey,
            enabled: aiProviders.enabled,
            createdAt: aiProviders.createdAt,
            updatedAt: aiProviders.updatedAt
          })
          .from(aiProviders)
          .where(eq(aiProviders.userId, session.user.id))
          .orderBy(aiProviders.createdAt)

        // 脱敏 apiKey
        const masked = list.map(p => ({
          ...p,
          apiKey: maskApiKey(p.apiKey)
        }))

        return jsonResponse(masked)
      },

      POST: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = createAiProviderSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const [created] = await db
          .insert(aiProviders)
          .values({
            ...parsed.data,
            userId: session.user.id
          })
          .returning()

        return jsonResponse(created, 201)
      }
    }
  }
})
