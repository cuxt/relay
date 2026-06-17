import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth/auth'
import { ROUTES } from '@/constants'

export const authMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: ROUTES.LOGIN })
  }

  return next({
    context: { user: session.user, session: session.session },
  })
})
