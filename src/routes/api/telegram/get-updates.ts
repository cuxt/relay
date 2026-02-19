import { createFileRoute } from '@tanstack/react-router'
import { requireSession } from '@/middleware/api-auth'
import { jsonResponse, errorResponse } from '@/lib/api/response'

export const Route = createFileRoute('/api/telegram/get-updates')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { error } = await requireSession(request)
        if (error) return error

        const body = await request.json()
        const { botToken } = body

        if (!botToken || typeof botToken !== 'string') {
          return errorResponse('BAD_REQUEST', '请提供 Bot Token', 400)
        }

        try {
          const res = await fetch(
            `https://api.telegram.org/bot${botToken}/getUpdates?limit=20&timeout=0`
          )
          const data = await res.json()

          if (!data.ok) {
            return errorResponse(
              'TELEGRAM_ERROR',
              data.description || 'Bot Token 无效',
              400
            )
          }

          // 从 updates 中提取唯一的 chat 信息
          const chatMap = new Map<
            number,
            { id: number; title: string; type: string }
          >()

          for (const update of data.result || []) {
            const msg =
              update.message ||
              update.channel_post ||
              update.my_chat_member?.chat
            if (!msg) continue

            const chat = msg.chat || msg
            if (chat?.id && !chatMap.has(chat.id)) {
              chatMap.set(chat.id, {
                id: chat.id,
                title:
                  chat.title ||
                  chat.first_name ||
                  chat.username ||
                  String(chat.id),
                type: chat.type || 'unknown'
              })
            }
          }

          return jsonResponse({
            chats: Array.from(chatMap.values())
          })
        } catch (err: any) {
          return errorResponse(
            'FETCH_ERROR',
            err.message || '请求 Telegram API 失败',
            500
          )
        }
      }
    }
  }
})
