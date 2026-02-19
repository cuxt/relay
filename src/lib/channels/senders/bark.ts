import type { Sender } from './types'

export const sendBark: Sender = async ({ message, channel }) => {
  if (!channel.barkServerUrl || !channel.barkDeviceKey) {
    return { success: false, errorMessage: 'Bark 配置不完整' }
  }

  const url = `${channel.barkServerUrl.replace(/\/$/, '')}/${channel.barkDeviceKey}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Relay 通知',
        body: message
      })
    })

    const resBody = await res.text()
    const json = JSON.parse(resBody)

    return {
      success: json.code === 200,
      responseBody: resBody,
      responseStatus: res.status,
      errorMessage: json.code !== 200 ? json.message : undefined
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
