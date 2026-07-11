import { Elysia } from 'elysia'
import { requireLogin } from '@/server/guards'

/**
 * Telegram 辅助 API：用前端提供的 Bot Token 拉取最近会话，
 * 供渠道表单选择 chat id。token 不入库，仅当次请求透传给 Telegram。
 * 从 relay 的 TanStack API Routes 迁移而来。
 */
export const telegramRoutes = new Elysia({ name: 'telegram' })
  .use(requireLogin)
  .post(
    '/api/telegram/get-updates',
    async ({ request, status }) => {
      const body = await request.json().catch(() => null)
      const { botToken } = body || {}

      if (!botToken || typeof botToken !== 'string') {
        return status(400, { error: '请提供 Bot Token' })
      }

      try {
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/getUpdates?limit=20&timeout=0`
        )
        const data = await res.json()

        if (!data.ok) {
          return status(400, { error: data.description || 'Bot Token 无效' })
        }

        // 从 updates 中提取唯一的 chat 信息
        const chatMap = new Map<number, { id: number; title: string; type: string }>()

        for (const update of data.result || []) {
          const msg =
            update.message || update.channel_post || update.my_chat_member?.chat
          if (!msg) continue

          const chat = msg.chat || msg
          if (chat?.id && !chatMap.has(chat.id)) {
            chatMap.set(chat.id, {
              id: chat.id,
              title: chat.title || chat.first_name || chat.username || String(chat.id),
              type: chat.type || 'unknown'
            })
          }
        }

        return { chats: Array.from(chatMap.values()) }
      } catch (err: any) {
        return status(500, { error: err.message || '请求 Telegram API 失败' })
      }
    },
    {
      requireLogin: true,
      detail: { tags: ['Telegram'], summary: '拉取最近会话列表（供渠道表单选 chat id）' }
    }
  )
