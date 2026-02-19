import type { Sender } from './types'
import crypto from 'node:crypto'

function generateSign(timestamp: string, secret: string): string {
  const stringToSign = `${timestamp}\n${secret}`
  const hmac = crypto.createHmac('sha256', stringToSign)
  hmac.update('')
  return hmac.digest('base64')
}

function buildTextBody(message: string): Record<string, unknown> {
  return {
    msg_type: 'text',
    content: { text: message }
  }
}

function buildCardBody(message: string): Record<string, unknown> {
  return {
    msg_type: 'interactive',
    card: {
      schema: '2.0',
      body: {
        direction: 'vertical',
        elements: [
          {
            tag: 'markdown',
            content: message,
            text_align: 'left'
          }
        ]
      }
    }
  }
}

export const sendFeishu: Sender = async ({ message, channel, endpoint }) => {
  if (!channel.webhookUrl) {
    return { success: false, errorMessage: '未配置 Webhook 地址' }
  }

  const messageType = endpoint.messageType || 'text'
  const body =
    messageType === 'markdown' ? buildCardBody(message) : buildTextBody(message)

  // 签名验证
  if (channel.secret) {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    body.timestamp = timestamp
    body.sign = generateSign(timestamp, channel.secret)
  }

  try {
    const res = await fetch(channel.webhookUrl, {
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
