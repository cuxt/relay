import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { authMiddleware } from './auth'
import { ROLES, ROUTES } from '@/constants'

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (context.user.role !== ROLES.ADMIN) {
      throw redirect({ to: ROUTES.DASHBOARD })
    }

    return next({ context: {} })
  })
