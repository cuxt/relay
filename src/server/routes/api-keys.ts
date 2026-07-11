import { Elysia, t } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/db/schema/api-keys'
import { generateApiKey } from '@/lib/crypto-tokens'
import { requireLogin } from '@/server/guards'

const createSchema = z.object({
  name: z.string().min(1, '请输入密钥名称').max(50),
  expiresAt: z.string().optional()
})

/**
 * API 密钥 API（列表遮罩 / 创建一次性返回明文 / 删除）。
 * 从 relay 的 TanStack API Routes 迁移而来；查询/校验逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例。
 */
export const apiKeyRoutes = new Elysia({ name: 'api-keys' })
  .use(requireLogin)
  .get(
    '/api/api-keys',
    async ({ session }) => {
      const list = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          // 不返回完整密钥，仅前 12 位 + 后 4 位
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
      return list.map(item => ({
        ...item,
        keyPreview: `${item.keyPreview.slice(0, 12)}...${item.keyPreview.slice(-4)}`
      }))
    },
    {
      requireLogin: true,
      detail: { tags: ['API 密钥'], summary: '获取当前用户 API 密钥列表（密钥遮罩）' }
    }
  )
  .post(
    '/api/api-keys',
    async ({ session, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = createSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      const key = generateApiKey()
      const [created] = await db
        .insert(apiKeys)
        .values({
          name: parsed.data.name,
          key,
          userId: session.user.id,
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
        })
        .returning()

      // 创建时返回完整密钥（仅此一次）
      return status(201, { ...created, key })
    },
    {
      requireLogin: true,
      detail: { tags: ['API 密钥'], summary: '创建 API 密钥（一次性返回明文）' }
    }
  )
  .delete(
    '/api/api-keys/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, params.id), eq(apiKeys.userId, session.user.id)))

      if (!existing) {
        return status(404, { error: 'API 密钥不存在' })
      }

      await db.delete(apiKeys).where(eq(apiKeys.id, params.id))

      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['API 密钥'], summary: '删除 API 密钥' },
      response: { 204: t.Null(), 404: t.Object({ error: t.String() }) }
    }
  )
