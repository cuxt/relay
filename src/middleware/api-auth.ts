import { auth } from '@/lib/auth/auth'
import { errorResponse } from '@/lib/api/response'

export async function requireSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return {
      session: null,
      error: errorResponse('UNAUTHORIZED', '未登录或会话已过期', 401)
    }
  }

  return { session, error: null }
}
