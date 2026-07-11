import { Elysia, t } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { aiProviders } from '@/lib/db/schema/ai-providers'
import {
  createAiProviderSchema,
  updateAiProviderSchema
} from '@/lib/ai/validation'
import { requireLogin } from '@/server/guards'

function maskApiKey(key: string): string {
  if (key.length <= 12) return '****'
  return key.slice(0, 8) + '****' + key.slice(-4)
}

/**
 * AI 服务（Provider）API（列表/详情/创建/更新/删除 + 拉取上游模型列表）。
 * 从 relay 的 TanStack API Routes 迁移而来；查询/校验逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例。
 * 列表返回时对 apiKey 脱敏。
 */
export const aiProviderRoutes = new Elysia({ name: 'ai-providers' })
  .use(requireLogin)
  .get(
    '/api/ai-providers',
    async ({ session }) => {
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
      return list.map(p => ({ ...p, apiKey: maskApiKey(p.apiKey) }))
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '获取当前用户 AI 服务列表（apiKey 脱敏）' }
    }
  )
  .post(
    '/api/ai-providers',
    async ({ session, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = createAiProviderSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      const [created] = await db
        .insert(aiProviders)
        .values({ ...parsed.data, userId: session.user.id })
        .returning()

      return status(201, created)
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '创建 AI 服务' }
    }
  )
  .get(
    '/api/ai-providers/:id',
    async ({ session, params, status }) => {
      const [provider] = await db
        .select()
        .from(aiProviders)
        .where(
          and(eq(aiProviders.id, params.id), eq(aiProviders.userId, session.user.id))
        )

      if (!provider) {
        return status(404, { error: 'AI 服务不存在' })
      }

      return provider
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '获取单个 AI 服务（含明文 apiKey）' }
    }
  )
  .patch(
    '/api/ai-providers/:id',
    async ({ session, params, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = updateAiProviderSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      const [existing] = await db
        .select()
        .from(aiProviders)
        .where(
          and(eq(aiProviders.id, params.id), eq(aiProviders.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: 'AI 服务不存在' })
      }

      const [updated] = await db
        .update(aiProviders)
        .set(parsed.data)
        .where(eq(aiProviders.id, params.id))
        .returning()

      return updated
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '更新 AI 服务' }
    }
  )
  .delete(
    '/api/ai-providers/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(aiProviders)
        .where(
          and(eq(aiProviders.id, params.id), eq(aiProviders.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: 'AI 服务不存在' })
      }

      await db.delete(aiProviders).where(eq(aiProviders.id, params.id))

      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '删除 AI 服务' },
      response: { 204: t.Null(), 404: t.Object({ error: t.String() }) }
    }
  )
  .get(
    '/api/ai-providers/:id/models',
    async ({ session, params, status }) => {
      const [provider] = await db
        .select()
        .from(aiProviders)
        .where(
          and(eq(aiProviders.id, params.id), eq(aiProviders.userId, session.user.id))
        )
      if (!provider) {
        return status(404, { error: 'AI 服务不存在' })
      }

      try {
        const baseUrl = provider.baseUrl.replace(/\/+$/, '')
        const res = await fetch(`${baseUrl}/models`, {
          headers: { Authorization: `Bearer ${provider.apiKey}` },
          signal: AbortSignal.timeout(10000)
        })

        if (!res.ok) {
          return status(502, {
            error: `获取模型列表失败: HTTP ${res.status}`
          })
        }

        const json = await res.json()
        const models: string[] = (json.data || [])
          .map((m: any) => m.id)
          .filter(Boolean)
          .sort()

        return models
      } catch (err: any) {
        return status(502, { error: `获取模型列表失败: ${err.message}` })
      }
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 服务'], summary: '拉取上游模型列表' },
      response: {
        200: t.Array(t.String()),
        404: t.Object({ error: t.String() }),
        502: t.Object({ error: t.String() })
      }
    }
  )
