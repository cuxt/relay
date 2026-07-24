import { Elysia, t } from 'elysia'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { channels } from '@/lib/db/schema/channels'
import { endpointChannels, endpoints } from '@/lib/db/schema/endpoints'
import { createEndpointSchema, updateEndpointSchema } from '@/lib/endpoints/validation'
import { generateEndpointToken } from '@/lib/crypto-tokens'
import { requireLogin } from '@/server/guards'

async function validateChannelIds(userId: string, channelIds: string[]) {
  const owned = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(eq(channels.userId, userId), inArray(channels.id, channelIds)))
  return new Set(owned.map((channel) => channel.id)).size === new Set(channelIds).size
}

async function attachChannels<T extends { id: string }>(items: T[]) {
  if (items.length === 0) return items.map((item) => ({ ...item, channels: [] }))

  const bindings = await db
    .select({
      endpointId: endpointChannels.endpointId,
      id: channels.id,
      name: channels.name,
      type: channels.type,
      enabled: channels.enabled,
    })
    .from(endpointChannels)
    .innerJoin(channels, eq(endpointChannels.channelId, channels.id))
    .where(
      inArray(
        endpointChannels.endpointId,
        items.map((item) => item.id)
      )
    )
    .orderBy(endpointChannels.createdAt)

  return items.map((item) => ({
    ...item,
    channels: bindings
      .filter((binding) => binding.endpointId === item.id)
      .map(({ endpointId: _, ...channel }) => channel),
  }))
}

export const endpointRoutes = new Elysia({ name: 'endpoints' })
  .use(requireLogin)
  .get(
    '/api/endpoints',
    async ({ session }) => {
      const items = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.userId, session.user.id))
        .orderBy(endpoints.createdAt)
      return attachChannels(items)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '获取当前用户端点列表' },
    }
  )
  .post(
    '/api/endpoints',
    async ({ session, request, status }) => {
      const parsed = createEndpointSchema.safeParse(await request.json().catch(() => null))
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map((issue) => issue.message).join(', '),
        })
      }

      const { channelIds, ...endpointData } = parsed.data
      if (!(await validateChannelIds(session.user.id, channelIds))) {
        return status(404, { error: '部分渠道不存在' })
      }

      const created = await db.transaction(async (tx) => {
        const [endpoint] = await tx
          .insert(endpoints)
          .values({
            ...endpointData,
            token: generateEndpointToken(),
            userId: session.user.id,
          })
          .returning()
        await tx.insert(endpointChannels).values(
          [...new Set(channelIds)].map((channelId) => ({
            endpointId: endpoint.id,
            channelId,
          }))
        )
        return endpoint
      })

      const [result] = await attachChannels([created])
      return status(201, result)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '创建端点' },
    }
  )
  .get(
    '/api/endpoints/:id',
    async ({ session, params, status }) => {
      const [item] = await db
        .select()
        .from(endpoints)
        .where(and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id)))
      if (!item) return status(404, { error: '端点不存在' })

      const [result] = await attachChannels([item])
      return result
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '获取单个端点' },
    }
  )
  .patch(
    '/api/endpoints/:id',
    async ({ session, params, request, status }) => {
      const parsed = updateEndpointSchema.safeParse(await request.json().catch(() => null))
      if (!parsed.success) {
        return status(400, {
          error: parsed.error.issues.map((issue) => issue.message).join(', '),
        })
      }

      const [existing] = await db
        .select()
        .from(endpoints)
        .where(and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id)))
      if (!existing) return status(404, { error: '端点不存在' })

      const { channelIds, ...endpointData } = parsed.data
      if (channelIds && !(await validateChannelIds(session.user.id, channelIds))) {
        return status(404, { error: '部分渠道不存在' })
      }

      const updated = await db.transaction(async (tx) => {
        let endpoint = existing
        if (Object.keys(endpointData).length > 0) {
          const [changed] = await tx
            .update(endpoints)
            .set(endpointData)
            .where(eq(endpoints.id, params.id))
            .returning()
          endpoint = changed
        }

        if (channelIds) {
          await tx.delete(endpointChannels).where(eq(endpointChannels.endpointId, params.id))
          await tx.insert(endpointChannels).values(
            [...new Set(channelIds)].map((channelId) => ({
              endpointId: params.id,
              channelId,
            }))
          )
        }
        return endpoint
      })

      const [result] = await attachChannels([updated])
      return result
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '更新端点' },
    }
  )
  .delete(
    '/api/endpoints/:id',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select({ id: endpoints.id })
        .from(endpoints)
        .where(and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id)))
      if (!existing) return status(404, { error: '端点不存在' })

      await db.delete(endpoints).where(eq(endpoints.id, params.id))
      return status(204, null)
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '删除端点' },
      response: { 204: t.Null(), 404: t.Object({ error: t.String() }) },
    }
  )
  .post(
    '/api/endpoints/:id/regenerate-token',
    async ({ session, params, status }) => {
      const [existing] = await db
        .select({ id: endpoints.id })
        .from(endpoints)
        .where(and(eq(endpoints.id, params.id), eq(endpoints.userId, session.user.id)))
      if (!existing) return status(404, { error: '端点不存在' })

      const [updated] = await db
        .update(endpoints)
        .set({ token: generateEndpointToken() })
        .where(eq(endpoints.id, params.id))
        .returning({ token: endpoints.token })
      return updated
    },
    {
      requireLogin: true,
      detail: { tags: ['端点'], summary: '重生成端点 token' },
      response: {
        200: t.Object({ token: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
