import { createFileRoute } from '@tanstack/react-router'
import { executePush } from '@/lib/push/executor'
import { jsonResponse, errorResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/push/$token')({
  server: {
    handlers: {
      POST: async ({
        request,
        params
      }: {
        request: Request
        params: { token: string }
      }) => {
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
          return jsonResponse({ message: result.message, logId: result.logId })
        }

        return errorResponse('PUSH_FAILED', result.message, 400)
      },

      GET: async ({
        request,
        params
      }: {
        request: Request
        params: { token: string }
      }) => {
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
          return jsonResponse({ message: result.message, logId: result.logId })
        }

        return errorResponse('PUSH_FAILED', result.message, 400)
      }
    }
  }
})
