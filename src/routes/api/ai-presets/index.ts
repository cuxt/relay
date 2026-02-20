import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiPresets } from '@/db/schemas/ai-presets.schema'
import { aiProviders } from '@/db/schemas/ai-providers.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { createAiPresetSchema } from '@/lib/ai/validation'

export const Route = createFileRoute('/api/ai-presets/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const list = await db
          .select({
            id: aiPresets.id,
            name: aiPresets.name,
            key: aiPresets.key,
            providerId: aiPresets.providerId,
            model: aiPresets.model,
            systemPrompt: aiPresets.systemPrompt,
            enabled: aiPresets.enabled,
            createdAt: aiPresets.createdAt,
            updatedAt: aiPresets.updatedAt,
            providerName: aiProviders.name
          })
          .from(aiPresets)
          .leftJoin(aiProviders, eq(aiPresets.providerId, aiProviders.id))
          .where(eq(aiPresets.userId, session.user.id))
          .orderBy(aiPresets.createdAt)

        return jsonResponse(list)
      },

      POST: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = createAiPresetSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        // 验证 provider 归属
        const [provider] = await db
          .select()
          .from(aiProviders)
          .where(
            and(
              eq(aiProviders.id, parsed.data.providerId),
              eq(aiProviders.userId, session.user.id)
            )
          )

        if (!provider) {
          return errorResponse('NOT_FOUND', 'AI 服务不存在', 404)
        }

        // 检查 key+userId 唯一性
        const [existing] = await db
          .select({ id: aiPresets.id })
          .from(aiPresets)
          .where(
            and(
              eq(aiPresets.key, parsed.data.key),
              eq(aiPresets.userId, session.user.id)
            )
          )

        if (existing) {
          return errorResponse(
            'VALIDATION_ERROR',
            `Key "${parsed.data.key}" 已存在`,
            400
          )
        }

        const [created] = await db
          .insert(aiPresets)
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
