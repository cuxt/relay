import type { Sender } from './types'

export const sendDiscord: Sender = async ({ message, channel }) => {
  if (!channel.webhookUrl) {
    return { success: false, errorMessage: '未配置 Discord Webhook 地址' }
  }

  try {
    const res = await fetch(channel.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    })

    const resBody = await res.text()

    // Discord 返回 204 No Content 表示成功
    return {
      success: res.status >= 200 && res.status < 300,
      responseBody: resBody || undefined,
      responseStatus: res.status,
      errorMessage: res.status >= 300 ? resBody : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
