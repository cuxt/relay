import { Elysia, t } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { endpoints } from '@/lib/db/schema/endpoints'
import { channels } from '@/lib/db/schema/channels'
import {
  createEndpointSchema,
  updateEndpointSchema
} from '@/lib/endpoints/validation'
import { generateEndpointToken } from '@/lib/crypto-tokens'
import { requireLogin } from '@/server/guards'

/**
 * 端点 API。
 * 从 relay 的 TanStack API Routes 迁移而来；查询/校验逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例（裸对象 + { error: string }）。
 *
 * create/update 的 schema 校验沿用 zod safeParse（不翻译为 TypeBox，保留动态校验）。
 */
export const endpointRoutes = new Elysia({ name: 'endpoints' })
  .use(requireLogin)
  .get(
    '/api/endpoints',
    async ({ session }) => {
      return db
        .select({
          id: endpoints.id,
          name: endpoints.name,
          token: endpoints.token,
          enabled: endpoints.enabled,
          channelId: endpoints.channelId,
          messageTemplate: endpoints.messageTemplate,
          messageType: endpoints.messageType,
          mentionedUserIds: endpoints.mentionedUserIds,
          mentionedMobiles: endpoints.mentionedMobiles,
          createdAt: endpoints.createdAt,
          updatedAt: endpoints.updatedAt,
          channelName: channels.name,
          channelType: channels.type,
          channelEnabled: channels.enabled
        })
        .from(endpoints)
        .innerJoin(channels, eq(endpoints.channelId, channels.id))
        .where(eq(endpoints.userId, session.user.id))
        .orderBy(endpoints.createdAt)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '获取当前用户端点列表（含渠道名）' }
    }
  )
  .post(
    '/api/endpoints',
    async ({ session, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = createEndpointSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      // 验证渠道归属
      const [ch] = await db
        .select()
        .from(channels)
        .where(
          and(eq(channels.id, parsed.data.channelId), eq(channels.userId, session.user.id))
        )
      if (!ch) {
        return status(404, { error: '渠道不存在' })
      }

      const [created] = await db
        .insert(endpoints)
        .values({
          ...parsed.data,
          token: generateEndpointToken(),
          userId: session.user.id
        })
        .returning()

      return status(201, created)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '创建端点' }
    }
  )
  .get(
    '/api/endpoints/:id',
    async ({ session, params, status }) => {
      const result = await db
        .select({
          id: endpoints.id,
          name: endpoints.name,
          token: endpoints.token,
          enabled: endpoints.enabled,
          channelId: endpoints.channelId,
          messageTemplate: endpoints.messageTemplate,
          messageType: endpoints.messageType,
          mentionedUserIds: endpoints.mentionedUserIds,
          mentionedMobiles: endpoints.mentionedMobiles,
          createdAt: endpoints.createdAt,
          updatedAt: endpoints.updatedAt,
          channelName: channels.name,
          channelType: channels.type
        })
        .from(endpoints)
        .innerJoin(channels, eq(endpoints.channelId, channels.id))
        .where(
          and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id))
        )

      if (!result.length) {
        return status(404, { error: '端点不存在' })
      }

      return result[0]
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '获取单个端点' }
    }
  )
  .patch(
    '/api/endpoints/:id',
    async ({ session, params, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = updateEndpointSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map(i => i.message).join(', ')
        })
      }

      const [existing] = await db
        .select()
        .from(endpoints)
        .where(
          and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: '端点不存在' })
      }

      // 如果更新了 channelId，验证渠道归属
      if (parsed.data.channelId) {
        const [ch] = await db
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.id, parsed.data.channelId),
              eq(channels.userId, session.user.id)
            )
          )
        if (!ch) {
          return status(404, { error: '渠道不存在' })
        }
      }

      const [updated] = await db
        .update(endpoints)
        .set(parsed.data)
        .where(eq(endpoints.id, params.id))
        .returning()

      return updated
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '更新端点' }
    }
  )
  .delete(
    '/api/endpoints/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(endpoints)
        .where(
          and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: '端点不存在' })
      }

      await db.delete(endpoints).where(eq(endpoints.id, params.id))

      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '删除端点' },
      response: { 204: t.Null(), 404: t.Object({ error: t.String() }) }
    }
  )
  .post(
    '/api/endpoints/:id/regenerate-token',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(endpoints)
        .where(
          and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id))
        )
      if (!existing) {
        return status(404, { error: '端点不存在' })
      }

      const newToken = generateEndpointToken()
      const [updated] = await db
        .update(endpoints)
        .set({ token: newToken })
        .where(eq(endpoints.id, params.id))
        .returning()

      return { token: updated.token }
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '重生成端点 token' },
      response: {
        200: t.Object({ token: t.String() }),
        404: t.Object({ error: t.String() })
      }
    }
  )
