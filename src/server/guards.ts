import { Elysia } from 'elysia'
import { auth } from '@/lib/auth/auth'
import { ROLES } from '@/constants'

/**
 * 管理员鉴权守卫插件。
 * 用法：new Elysia().use(requireAdmin).get('/x', ({ session }) => ..., { requireAdmin: true })
 * 在路由上声明 `requireAdmin: true` 即解析 session 并校验管理员角色，失败返回 403。
 */
export const requireAdmin = new Elysia({ name: 'require-admin' }).macro({
  requireAdmin: {
    resolve: async ({ request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session || session.user.role !== ROLES.ADMIN) {
        return status(403, { error: '需要管理员权限' })
      }
      return { session }
    },
  },
})

/**
 * 登录鉴权守卫插件。
 * 用法：new Elysia().use(requireLogin).get('/x', ({ session }) => ..., { requireLogin: true })
 * 路由声明 `requireLogin: true` 即解析 session，未登录返回 401。
 */
export const requireLogin = new Elysia({ name: 'require-login' }).macro({
  requireLogin: {
    resolve: async ({ request, status }) => {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session) {
        return status(401, { error: '未登录' })
      }
      return { session }
    },
  },
})
