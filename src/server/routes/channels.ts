import { Elysia, t } from 'elysia'
import { and, count, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { channels } from '@/lib/db/schema/channels'
import { ChannelType, getChannelMeta } from '@/lib/channels/registry'
import { createChannelSchema, updateChannelSchema } from '@/lib/channels/validation'
import { requireLogin } from '@/server/guards'

/**
 * 渠道 API。
 * 从 relay 的 TanStack API Routes 迁移而来；查询/校验逻辑原样保留，
 * 鉴权改用 requireLogin macro，返回结构改用 Elysia 惯例（裸对象 + { error: string }）。
 *
 * 注意：create/update 的 config 是按 channel type 动态校验（zod discriminatedUnion），
 * 无法静态表达为 Elysia TypeBox body schema，故仍用 zod safeParse 手动校验。
 */
export const channelRoutes = new Elysia({ name: 'channels' })
  .use(requireLogin)
  .get(
    '/api/channels',
    async ({ session }) => {
      return db
        .select()
        .from(channels)
        .where(eq(channels.userId, session.user.id))
        .orderBy(channels.createdAt)
    },
    {
      requireLogin: true,
      detail: { tags: ['渠道'], summary: '获取当前用户渠道列表' },
    }
  )
  .get(
    '/api/channels/options',
    async ({ session, query }) => {
      const page = Math.max(1, Number(query.page || '1'))
      const limit = Math.min(50, Math.max(1, Number(query.limit || '10')))
      const search = query.search?.trim()
      const searchCondition = search
        ? or(
            ilike(channels.name, `%${search}%`),
            sql`${channels.type}::text ILIKE ${`%${search}%`}`
          )
        : undefined
      const where = searchCondition
        ? and(eq(channels.userId, session.user.id), searchCondition)
        : eq(channels.userId, session.user.id)

      const [{ total }] = await db.select({ total: count() }).from(channels).where(where)
      const items = await db
        .select({
          id: channels.id,
          name: channels.name,
          type: channels.type,
          enabled: channels.enabled,
        })
        .from(channels)
        .where(where)
        .orderBy(channels.createdAt)
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }
    },
    {
      requireLogin: true,
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
      detail: { tags: ['渠道'], summary: '分页获取渠道选择项' },
    }
  )
  .post(
    '/api/channels',
    async ({ session, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = createChannelSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map((i) => i.message).join(', '),
        })
      }

      const data = parsed.data
      const [created] = await db
        .insert(channels)
        .values({
          name: data.name,
          type: data.type,
          enabled: data.enabled,
          config: data.config,
          userId: session.user.id,
        })
        .returning()

      return status(201, created)
    },
    {
      requireLogin: true,
      detail: { tags: ['渠道'], summary: '创建渠道' },
    }
  )
  .get(
    '/api/channels/:id',
    async ({ session, params, status }) => {
      const [channel] = await db
        .select()
        .from(channels)
        .where(and(eq(channels.id, params.id), eq(channels.userId, session.user.id)))

      if (!channel) {
        return status(404, { error: '渠道不存在' })
      }

      return channel
    },
    {
      requireLogin: true,
      detail: { tags: ['渠道'], summary: '获取单个渠道' },
    }
  )
  .patch(
    '/api/channels/:id',
    async ({ session, params, request, status }) => {
      const body = await request.json().catch(() => null)
      const parsed = updateChannelSchema.safeParse(body)
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map((i) => i.message).join(', '),
        })
      }

      const [existing] = await db
        .select()
        .from(channels)
        .where(and(eq(channels.id, params.id), eq(channels.userId, session.user.id)))

      if (!existing) {
        return status(404, { error: '渠道不存在' })
      }

      // config 按 existing.type 动态校验
      if (parsed.data.config) {
        const meta = getChannelMeta(existing.type as ChannelType)
        const configParsed = meta.configSchema.safeParse(parsed.data.config)
        if (!configParsed.success) {
          return status(400, {
            error: configParsed.error.issues.map((i) => i.message).join(', '),
          })
        }
      }

      const [updated] = await db
        .update(channels)
        .set(parsed.data)
        .where(eq(channels.id, params.id))
        .returning()

      return updated
    },
    {
      requireLogin: true,
      detail: { tags: ['渠道'], summary: '更新渠道' },
    }
  )
  .delete(
    '/api/channels/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select()
        .from(channels)
        .where(and(eq(channels.id, params.id), eq(channels.userId, session.user.id)))

      if (!existing) {
        return status(404, { error: '渠道不存在' })
      }

      await db.delete(channels).where(eq(channels.id, params.id))

      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['渠道'], summary: '删除渠道' },
      response: {
        204: t.Null(),
        404: t.Object({ error: t.String() }),
      },
    }
  )
