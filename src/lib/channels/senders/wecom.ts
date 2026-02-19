import type { Sender } from './types'

export const sendWecom: Sender = async ({ message, channel, endpoint }) => {
  if (!channel.webhookUrl) {
    return { success: false, errorMessage: '未配置 Webhook 地址' }
  }

  const mentionedList = endpoint.mentionedUserIds
    ? endpoint.mentionedUserIds
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined

  const mentionedMobileList = endpoint.mentionedMobiles
    ? endpoint.mentionedMobiles
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined

  const messageType = endpoint.messageType || 'text'

  const body =
    messageType === 'markdown'
      ? {
          msgtype: 'markdown',
          markdown: { content: message }
        }
      : {
          msgtype: 'text',
          text: {
            content: message,
            mentioned_list: mentionedList,
            mentioned_mobile_list: mentionedMobileList
          }
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
      success: json.errcode === 0,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: json.errcode !== 0 ? json.errmsg : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
