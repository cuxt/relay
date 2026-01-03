import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { channel } from '@/db/schemas/channel.schema'
import { auth } from '@/lib/auth/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq, and } from 'drizzle-orm'
import { updateChannelSchema } from '@/lib/channel/validation'

export const Route = createFileRoute('/api/channels/$id')({
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
          .select()
          .from(channel)
          .where(
            and(eq(channel.id, params.id), eq(channel.userId, session.user.id))
          )

        if (result.length === 0) {
          return new Response('Channel not found', { status: 404 })
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
          const validatedData = updateChannelSchema.parse(body)

          const updated = await db
            .update(channel)
            .set(validatedData)
            .where(
              and(
                eq(channel.id, params.id),
                eq(channel.userId, session.user.id)
              )
            )
            .returning()

          if (updated.length === 0) {
            return new Response('Channel not found', { status: 404 })
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
          .delete(channel)
          .where(
            and(eq(channel.id, params.id), eq(channel.userId, session.user.id))
          )
          .returning()

        if (deleted.length === 0) {
          return new Response('Channel not found', { status: 404 })
        }

        return new Response(null, { status: 204 })
      }
    }
  }
})
