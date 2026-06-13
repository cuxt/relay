import crypto from 'node:crypto'
import type { SendContext, SendResult } from '../types'
import type { DingtalkConfig } from './dingtalk'

export async function sendDingtalk({ message, config, endpoint }: SendContext<DingtalkConfig>): Promise<SendResult> {
  if (!config.webhook) {
    return { success: false, errorMessage: '未配置 Webhook 地址' }
  }

  let url = config.webhook

  if (config.secret) {
    const timestamp = Date.now()
    const stringToSign = `${timestamp}\n${config.secret}`
    const hmac = crypto.createHmac('sha256', config.secret)
    hmac.update(stringToSign)
    const sign = encodeURIComponent(hmac.digest('base64'))
    url += `&timestamp=${timestamp}&sign=${sign}`
  }

  const messageType = endpoint.messageType || 'text'
  const lines = message.split('\n')
  const title = lines[0] || '通知'

  const body =
    messageType === 'markdown'
      ? { msgtype: 'markdown', markdown: { title, text: message } }
      : { msgtype: 'text', text: { content: message } }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const resBody = await res.text()
    const json = JSON.parse(resBody)

    return {
      success: json.errcode === 0,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: json.errcode !== 0 ? json.errmsg : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
