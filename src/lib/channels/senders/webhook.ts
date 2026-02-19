import type { Sender } from './types'

export const sendWebhook: Sender = async ({ message, channel }) => {
  if (!channel.webhookUrl) {
    return { success: false, errorMessage: '未配置 Webhook 地址' }
  }

  const method = channel.webhookMethod || 'POST'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(channel.webhookHeaders || {})
  }

  try {
    const init: RequestInit = { method, headers }

    if (method !== 'GET') {
      init.body = JSON.stringify({ content: message })
    }

    const res = await fetch(channel.webhookUrl, init)
    const resBody = await res.text()

    return {
      success: res.status >= 200 && res.status < 300,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: res.status >= 300 ? resBody : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
