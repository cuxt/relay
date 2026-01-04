import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoint } from '@/db/schemas/endpoint.schema'
import { channel } from '@/db/schemas/channel.schema'
import { auth } from '@/lib/auth/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq, and } from 'drizzle-orm'
import { updateEndpointSchema } from '@/lib/endpoint/validation'

export const Route = createFileRoute('/api/endpoints/$id')({
  server: {
    handlers: {
      GET: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        const result = await db
          .select({
            id: endpoint.id,
            name: endpoint.name,
            config: endpoint.config,
            status: endpoint.status,
            userId: endpoint.userId,
            channelId: endpoint.channelId,
            createdAt: endpoint.createdAt,
            updatedAt: endpoint.updatedAt,
            channel: {
              id: channel.id,
              name: channel.name,
              type: channel.type
            }
          })
          .from(endpoint)
          .innerJoin(channel, eq(endpoint.channelId, channel.id))
          .where(
            and(
              eq(endpoint.id, params.id),
              eq(endpoint.userId, session.user.id)
            )
          )

        if (result.length === 0) {
          return new Response('Endpoint not found', { status: 404 })
        }

        return new Response(JSON.stringify(result[0]), {
          headers: { 'Content-Type': 'application/json' }
        })
      },

      PATCH: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        try {
          const body = await request.json()
          const validatedData = updateEndpointSchema.parse(body)

          // 如果更新channelId，验证新channel所有权
          if (validatedData.channelId) {
            const channelExists = await db
              .select()
              .from(channel)
              .where(eq(channel.id, validatedData.channelId))
              .limit(1)

            if (
              channelExists.length === 0 ||
              channelExists[0].userId !== session.user.id
            ) {
              return new Response(
                JSON.stringify({
                  message: '无效的渠道ID或无权限访问该渠道'
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            }
          }

          const updated = await db
            .update(endpoint)
            .set(validatedData)
            .where(
              and(
                eq(endpoint.id, params.id),
                eq(endpoint.userId, session.user.id)
              )
            )
            .returning()

          if (updated.length === 0) {
            return new Response('Endpoint not found', { status: 404 })
          }

          return new Response(JSON.stringify(updated[0]), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (error) {
          if (error instanceof Error) {
            return new Response(JSON.stringify({ message: error.message }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            })
          }
          return new Response('Bad Request', { status: 400 })
        }
      },

      DELETE: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        const deleted = await db
          .delete(endpoint)
          .where(
            and(
              eq(endpoint.id, params.id),
              eq(endpoint.userId, session.user.id)
            )
          )
          .returning()

        if (deleted.length === 0) {
          return new Response('Endpoint not found', { status: 404 })
        }

        return new Response(null, { status: 204 })
      }
    }
  }
})
