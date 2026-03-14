import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'
import { authMiddleware } from '@/middleware/auth'

export type Session = typeof auth.$Infer.Session

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  return session as Session | null
})

export const getAuthenticatedUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return { user: context.user, session: context.session }
  })
