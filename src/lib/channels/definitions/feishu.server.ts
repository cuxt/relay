import crypto from 'node:crypto'
import type { SendContext, SendResult } from '../types'
import type { FeishuConfig } from './feishu'

export async function sendFeishu({ message, config, endpoint }: SendContext<FeishuConfig>): Promise<SendResult> {
  if (!config.webhook) {
    return { success: false, errorMessage: '未配置 Webhook 地址' }
  }

  const messageType = endpoint.messageType || 'text'

  const body: Record<string, unknown> =
    messageType === 'markdown'
      ? {
          msg_type: 'interactive',
          card: {
            schema: '2.0',
            body: {
              direction: 'vertical',
              elements: [{ tag: 'markdown', content: message, text_align: 'left' }]
            }
          }
        }
      : { msg_type: 'text', content: { text: message } }

  if (config.secret) {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const stringToSign = `${timestamp}\n${config.secret}`
    const hmac = crypto.createHmac('sha256', stringToSign)
    hmac.update('')
    body.timestamp = timestamp
    body.sign = encodeURIComponent(hmac.digest('base64'))
  }

  try {
    const res = await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const resBody = await res.text()
    const json = JSON.parse(resBody)

    return {
      success: json.code === 0,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: json.code !== 0 ? json.msg : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
