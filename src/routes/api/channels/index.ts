import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { channel } from '@/db/schemas/channel.schema'
import { auth } from '@/lib/auth/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { createChannelSchema } from '@/lib/channel/validation'

export const Route = createFileRoute('/api/channels/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const headers = getRequestHeaders()
        const session = await auth.api.getSession({ headers })

        if (!session?.user?.id) {
          return new Response('Unauthorized', { status: 401 })
        }

        const channels = await db
          .select()
          .from(channel)
          .where(eq(channel.userId, session.user.id))
          .orderBy(channel.createdAt)

        return new Response(JSON.stringify(channels), {
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
          const validatedData = createChannelSchema.parse(body)

          const newChannel = await db
            .insert(channel)
            .values({
              id: nanoid(),
              name: validatedData.name,
              type: validatedData.type,
              config: validatedData.config,
              status: validatedData.status || 'active',
              userId: session.user.id
            })
            .returning()

          return new Response(JSON.stringify(newChannel[0]), {
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
