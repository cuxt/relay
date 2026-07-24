import { Elysia } from 'elysia'
import { auth } from '@/lib/auth/auth'
import { isAdmin, isSuper } from '@/constants'

/**
 * 管理员鉴权守卫插件。
 * 用法：new Elysia().use(requireAdmin).get('/x', ({ session }) => ..., { requireAdmin: true })
 * 在路由上声明 `requireAdmin: true` 即解析 session 并校验管理员角色，失败返回 403。
 */
export const requireAdmin = new Elysia({ name: 'require-admin' }).macro({
  requireAdmin: {
    resolve: async ({ request, status }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
        query: { disableCookieCache: true },
      })
      if (!session || !isAdmin(session.user.role)) {
        return status(403, { error: '需要管理员权限' })
      }
      return { session }
    },
  },
})

/**
 * 超级管理员鉴权守卫插件。
 * 用法：new Elysia().use(requireSuper).get('/x', ({ session }) => ..., { requireSuper: true })
 * 路由声明 `requireSuper: true` 即只允许超级管理员访问。
 */
export const requireSuper = new Elysia({ name: 'require-super' }).macro({
  requireSuper: {
    resolve: async ({ request, status }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
        query: { disableCookieCache: true },
      })
      if (!session || !isSuper(session.user.role)) {
        return status(403, { error: '需要超级管理员权限' })
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
      const session = await auth.api.getSession({
        headers: request.headers,
        query: { disableCookieCache: true },
      })
      if (!session) {
        return status(401, { error: '未登录' })
      }
      return { session }
    },
  },
})
