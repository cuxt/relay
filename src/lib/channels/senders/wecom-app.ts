import type { Sender } from './types'

// 企微应用消息需要先获取 access_token
async function getAccessToken(corpId: string, secret: string): Promise<string> {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.errcode !== 0) {
    throw new Error(`获取 access_token 失败: ${json.errmsg}`)
  }
  return json.access_token
}

export const sendWecomApp: Sender = async ({ message, channel, endpoint }) => {
  if (!channel.corpId || !channel.appSecret || !channel.agentId) {
    return { success: false, errorMessage: '企微应用配置不完整' }
  }

  try {
    const accessToken = await getAccessToken(channel.corpId, channel.appSecret)
    const messageType = endpoint.messageType || 'text'

    const body =
      messageType === 'markdown'
        ? {
            touser: '@all',
            msgtype: 'markdown',
            agentid: Number(channel.agentId),
            markdown: { content: message }
          }
        : {
            touser: '@all',
            msgtype: 'text',
            agentid: Number(channel.agentId),
            text: { content: message }
          }

    const res = await fetch(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    )

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
