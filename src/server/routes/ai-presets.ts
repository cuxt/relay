import { Elysia, t } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { aiPresets } from '@/lib/db/schema/ai-presets'
import { aiProviders } from '@/lib/db/schema/ai-providers'
import {
  createAiPresetSchema,
  updateAiPresetSchema
} from '@/lib/ai/validation'
import { processMessageWithAi } from '@/lib/ai/process'
import { requireLogin } from '@/server/guards'

/**
 * AI 预设 API（列表/详情/创建/更新/删除 + 预览处理结果）。
 * 从 relay 的 TanStack API Routes 迁移而来；查询/校验逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例。
 */
export const aiPresetRoutes = new Elysia({ name: 'ai-presets' })
  .use(requireLogin)
  .get(
    '/api/ai-presets',
    async ({ session }) => {
      return db
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
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '获取当前用户 AI 预设列表' }
    }
  )
  .post(
    '/api/ai-presets',
    async ({ session, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = createAiPresetSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
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
        return status(404, { error: 'AI 服务不存在' })
      }

      // 检查 key+userId 唯一性
      const [existing] = await db
        .select({ id: aiPresets.id })
        .from(aiPresets)
        .where(
          and(eq(aiPresets.key, parsed.data.key), eq(aiPresets.userId, session.user.id))
        )
      if (existing) {
        return status(400, { error: `Key "${parsed.data.key}" 已存在` })
      }

      const [created] = await db
        .insert(aiPresets)
        .values({ ...parsed.data, userId: session.user.id })
        .returning()

      return status(201, created)
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '创建 AI 预设' }
    }
  )
  .get(
    '/api/ai-presets/:id',
    async ({ session, params, status }) => {
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
          and(eq(aiPresets.id, params.id), eq(aiPresets.userId, session.user.id))
        )

      if (!result.length) {
        return status(404, { error: 'AI 预设不存在' })
      }

      return result[0]
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '获取单个 AI 预设' }
    }
  )
  .patch(
    '/api/ai-presets/:id',
    async ({ session, params, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = updateAiPresetSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      const [existing] = await db
        .select()
        .from(aiPresets)
        .where(
          and(eq(aiPresets.id, params.id), eq(aiPresets.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: 'AI 预设不存在' })
      }

      // 如果更新了 key，检查唯一性
      if (parsed.data.key && parsed.data.key !== existing.key) {
        const [dup] = await db
          .select({ id: aiPresets.id })
          .from(aiPresets)
          .where(
            and(eq(aiPresets.key, parsed.data.key), eq(aiPresets.userId, session.user.id))
          )
        if (dup) {
          return status(400, { error: `Key "${parsed.data.key}" 已存在` })
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
          return status(404, { error: 'AI 服务不存在' })
        }
      }

      const [updated] = await db
        .update(aiPresets)
        .set(parsed.data)
        .where(eq(aiPresets.id, params.id))
        .returning()

      return updated
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '更新 AI 预设' }
    }
  )
  .delete(
    '/api/ai-presets/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(aiPresets)
        .where(
          and(eq(aiPresets.id, params.id), eq(aiPresets.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: 'AI 预设不存在' })
      }

      await db.delete(aiPresets).where(eq(aiPresets.id, params.id))

      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '删除 AI 预设' },
      response: { 204: t.Null(), 404: t.Object({ error: t.String() }) }
    }
  )
  .post(
    '/api/ai-presets/:id/preview',
    async ({ session, params, request, status }) => {
      const body = await request.json().catch(() => null)
      const message = body?.message

      if (!message || typeof message !== 'string') {
        return status(400, { error: '请提供 message 字段' })
      }

      // 验证预设归属
      const [preset] = await db
        .select()
        .from(aiPresets)
        .where(
          and(eq(aiPresets.id, params.id), eq(aiPresets.userId, session.user.id))
        )
      if (!preset) {
        return status(404, { error: 'AI 预设不存在' })
      }

      const result = await processMessageWithAi(params.id, message)

      if (result.success) {
        return {
          processedMessage: result.processedMessage!,
          latencyMs: result.latencyMs
        }
      }

      return status(500, { error: result.errorMessage || 'AI 处理失败' })
    },
    {
      requireLogin: true,
      detail: { tags: ['AI 预设'], summary: '预览 AI 预设对消息的处理结果' },
      response: {
        200: t.Object({
          processedMessage: t.String(),
          latencyMs: t.Number()
        }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() })
      }
    }
  )
