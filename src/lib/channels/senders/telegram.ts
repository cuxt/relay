import type { Sender } from './types'

export const sendTelegram: Sender = async ({ message, channel, endpoint }) => {
  if (!channel.botToken || !channel.chatId) {
    return { success: false, errorMessage: 'Telegram 配置不完整' }
  }

  const url = `https://api.telegram.org/bot${channel.botToken}/sendMessage`
  const messageType = endpoint.messageType || 'text'

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel.chatId,
        text: message,
        parse_mode: messageType === 'markdown' ? 'MarkdownV2' : undefined
      })
    })

    const resBody = await res.text()
    const json = JSON.parse(resBody)

    return {
      success: json.ok === true,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: !json.ok ? json.description : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
