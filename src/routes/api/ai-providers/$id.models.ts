import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { aiProviders } from '@/db/schemas/ai-providers.schema'
import { eq, and } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/ai-providers/$id/models')({
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

        try {
          const baseUrl = provider.baseUrl.replace(/\/+$/, '')
          const res = await fetch(`${baseUrl}/models`, {
            headers: {
              Authorization: `Bearer ${provider.apiKey}`
            },
            signal: AbortSignal.timeout(10000)
          })

          if (!res.ok) {
            return errorResponse(
              'UPSTREAM_ERROR',
              `获取模型列表失败: HTTP ${res.status}`,
              502
            )
          }

          const json = await res.json()
          const models: string[] = (json.data || [])
            .map((m: any) => m.id)
            .filter(Boolean)
            .sort()

          return jsonResponse(models)
        } catch (err: any) {
          return errorResponse(
            'UPSTREAM_ERROR',
            `获取模型列表失败: ${err.message}`,
            502
          )
        }
      }
    }
  }
})
