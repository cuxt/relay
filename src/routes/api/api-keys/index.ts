import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { apiKeys } from '@/db/schemas/api-keys.schema'
import { eq } from 'drizzle-orm'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'
import { generateApiKey } from '@/lib/utils'
import { z } from 'zod/v4'

const createSchema = z.object({
  name: z.string().min(1, '请输入密钥名称').max(50),
  expiresAt: z.string().optional()
})

export const Route = createFileRoute('/api/api-keys/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const list = await db
          .select({
            id: apiKeys.id,
            name: apiKeys.name,
            // 不返回完整密钥，仅前8位 + 后4位
            keyPreview: apiKeys.key,
            enabled: apiKeys.enabled,
            lastUsedAt: apiKeys.lastUsedAt,
            expiresAt: apiKeys.expiresAt,
            createdAt: apiKeys.createdAt
          })
          .from(apiKeys)
          .where(eq(apiKeys.userId, session.user.id))
          .orderBy(apiKeys.createdAt)

        // 遮罩密钥
        const masked = list.map(item => ({
          ...item,
          keyPreview: `${item.keyPreview.slice(0, 12)}...${item.keyPreview.slice(-4)}`
        }))

        return jsonResponse(masked)
      },

      POST: async ({ request }: { request: Request }) => {
        const { session, error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const parsed = createSchema.safeParse(body)

        if (!parsed.success) {
          return errorResponse(
            'VALIDATION_ERROR',
            parsed.error.issues.map(i => i.message).join(', '),
            400
          )
        }

        const key = generateApiKey()
        const [created] = await db
          .insert(apiKeys)
          .values({
            name: parsed.data.name,
            key,
            userId: session.user.id,
            expiresAt: parsed.data.expiresAt
              ? new Date(parsed.data.expiresAt)
              : null
          })
          .returning()

        // 创建时返回完整密钥（仅此一次）
        return jsonResponse({ ...created, key }, 201)
      }
    }
  }
})
