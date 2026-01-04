import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoint } from '@/db/schemas/endpoint.schema'
import { channel } from '@/db/schemas/channel.schema'
import { auth } from '@/lib/auth/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { createEndpointSchema } from '@/lib/endpoint/validation'

export const Route = createFileRoute('/api/endpoints/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        // 联表查询，获取endpoint及其关联的channel信息
        const endpoints = await db
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
          .where(eq(endpoint.userId, session.user.id))
          .orderBy(endpoint.createdAt)

        return new Response(JSON.stringify(endpoints), {
          headers: { 'Content-Type': 'application/json' }
        })
      },

      POST: async ({ request }: { request: Request }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        try {
          const body = await request.json()
          const validatedData = createEndpointSchema.parse(body)

          // 验证channel是否属于当前用户
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
              JSON.stringify({ message: '无效的渠道ID或无权限访问该渠道' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const newEndpoint = await db
            .insert(endpoint)
            .values({
              id: nanoid(),
              name: validatedData.name,
              channelId: validatedData.channelId,
              config: validatedData.config || null,
              status: validatedData.status || 'active',
              userId: session.user.id
            })
            .returning()

          return new Response(JSON.stringify(newEndpoint[0]), {
            status: 201,
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
      }
    }
  }
})
