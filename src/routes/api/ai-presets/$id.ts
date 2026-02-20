import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiPresets } from '@/db/schemas/ai-presets.schema'
import { aiProviders } from '@/db/schemas/ai-providers.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { updateAiPresetSchema } from '@/lib/ai/validation'

export const Route = createFileRoute('/api/ai-presets/$id')({
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
          .where(
            and(
              eq(aiPresets.id, params.id),
              eq(aiPresets.userId, session.user.id)
            )
          )

        if (!result.length) {
          return errorResponse('NOT_FOUND', 'AI 预设不存在', 404)
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
        const parsed = updateAiPresetSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const [existing] = await db
          .select()
          .from(aiPresets)
          .where(
            and(
              eq(aiPresets.id, params.id),
              eq(aiPresets.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', 'AI 预设不存在', 404)
        }

        // 如果更新了 key，检查唯一性
        if (parsed.data.key && parsed.data.key !== existing.key) {
          const [dup] = await db
            .select({ id: aiPresets.id })
            .from(aiPresets)
            .where(
              and(
                eq(aiPresets.key, parsed.data.key),
                eq(aiPresets.userId, session.user.id)
              )
            )
          if (dup) {
            return errorResponse(
              'VALIDATION_ERROR',
              `Key "${parsed.data.key}" 已存在`,
              400
            )
          }
        }

        // 如果更新了 providerId，验证 provider 归属
        if (parsed.data.providerId) {
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
        }

        const [updated] = await db
          .update(aiPresets)
          .set(parsed.data)
          .where(eq(aiPresets.id, params.id))
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
          .from(aiPresets)
          .where(
            and(
              eq(aiPresets.id, params.id),
              eq(aiPresets.userId, session.user.id)
            )
          )

        if (!existing) {
          return errorResponse('NOT_FOUND', 'AI 预设不存在', 404)
        }

        await db.delete(aiPresets).where(eq(aiPresets.id, params.id))

        return jsonResponse(null, 204)
      }
    }
  }
})
