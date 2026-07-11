import { Elysia, t } from 'elysia'
import { executePush } from '@/lib/push/executor'

/**
 * 对外推送入口（POST / GET /api/push/:token）。
 * 不挂 requireLogin macro——按 URL 中的 endpoint token 鉴权，凭据在 executePush 内校验。
 * 从 relay 的 TanStack API Routes 迁移而来；返回结构改用 Elysia 惯例。
 */
export const pushRoutes = new Elysia({ name: 'push' })
  .post(
    '/api/push/:token',
    async ({ request, params, status }) => {
      let body: unknown
      try {
        body = await request.json()
      } catch {
        body = {}
      }

      const result = await executePush({
        token: params.token,
        body,
        ip:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })

      if (result.success) {
        return { message: result.message, logId: result.logId }
      }

      return status(400, { error: result.message })
    },
    {
      detail: {
        tags: ['推送'],
        summary: 'POST 推送（凭端点 token 鉴权）',
        description: '对外无登录态入口，按端点 token 找到所属端点与渠道并执行推送。'
      },
      response: {
        200: t.Object({ message: t.String(), logId: t.Optional(t.String()) }),
        400: t.Object({ error: t.String() })
      }
    }
  )
  .get(
    '/api/push/:token',
    async ({ request, params, status }) => {
      // 支持 GET 请求推送（将 query params 作为 body）
      const url = new URL(request.url)
      const body: Record<string, string> = {}

      url.searchParams.forEach((value, key) => {
        body[key] = value
      })

      const result = await executePush({
        token: params.token,
        body,
        ip:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          undefined,
        userAgent: request.headers.get('user-agent') || undefined
      })

      if (result.success) {
        return { message: result.message, logId: result.logId }
      }

      return status(400, { error: result.message })
    },
    {
      detail: {
        tags: ['推送'],
        summary: 'GET 推送（凭端点 token 鉴权）',
        description: '对外无登录态入口，把 query params 当作推送 body。'
      },
      response: {
        200: t.Object({ message: t.String(), logId: t.Optional(t.String()) }),
        400: t.Object({ error: t.String() })
      }
    }
  )
