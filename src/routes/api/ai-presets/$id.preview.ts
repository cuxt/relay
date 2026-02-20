import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiPresets } from '@/db/schemas/ai-presets.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { processMessageWithAi } from '@/lib/ai/process'

export const Route = createFileRoute('/api/ai-presets/$id/preview')({
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

        const body = await request.json()
        const message = body?.message

        if (!message || typeof message !== 'string') {
          return errorResponse('VALIDATION_ERROR', '请提供 message 字段', 400)
        }

        // 验证预设归属
        const [preset] = await db
          .select()
          .from(aiPresets)
          .where(
            and(
              eq(aiPresets.id, params.id),
              eq(aiPresets.userId, session.user.id)
            )
          )

        if (!preset) {
          return errorResponse('NOT_FOUND', 'AI 预设不存在', 404)
        }

        const result = await processMessageWithAi(params.id, message)

        if (result.success) {
          return jsonResponse({
            processedMessage: result.processedMessage,
            latencyMs: result.latencyMs
          })
        }

        return errorResponse(
          'AI_PROCESS_FAILED',
          result.errorMessage || 'AI 处理失败',
          500
        )
      }
    }
  }
})
