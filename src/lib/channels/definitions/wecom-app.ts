import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'

export const wecomAppConfigSchema = z.object({
  corpId: z.string().min(1, '请输入 Corp ID'),
  agentId: z.string().min(1, '请输入 Agent ID'),
  secret: z.string().min(1, '请输入 App Secret')
})

export type WecomAppConfig = z.infer<typeof wecomAppConfigSchema>

export const wecomAppConfigFields = [
  {
    key: 'corpId',
    label: 'Corp ID',
    placeholder: '企业 ID',
    required: true,
    description: '企业微信的企业 ID'
  },
  {
    key: 'agentId',
    label: 'Agent ID',
    placeholder: '应用 ID',
    required: true,
    description: '企业微信应用的 Agent ID'
  },
  {
    key: 'secret',
    label: 'App Secret',
    placeholder: '应用密钥',
    type: 'password' as const,
    required: true,
    description: '企业微信应用的密钥'
  }
]

async function getAccessToken(corpId: string, secret: string): Promise<string> {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.errcode !== 0) {
    throw new Error(`获取 access_token 失败: ${json.errmsg}`)
  }
  return json.access_token
}

export const wecomAppDefinition: ChannelDefinition<WecomAppConfig> = {
  type: 'wecom_app',
  label: '企微应用',
  color: '#07c160',

  configSchema: wecomAppConfigSchema,
  configFields: wecomAppConfigFields,

  sendMessage: async ({ message, config, endpoint }: SendContext<WecomAppConfig>): Promise<SendResult> => {
    if (!config.corpId || !config.secret || !config.agentId) {
      return { success: false, errorMessage: '企微应用配置不完整' }
    }

    try {
      const accessToken = await getAccessToken(config.corpId, config.secret)
      const messageType = endpoint.messageType || 'text'

      const body =
        messageType === 'markdown'
          ? {
              touser: '@all',
              msgtype: 'markdown',
              agentid: Number(config.agentId),
              markdown: { content: message }
            }
          : {
              touser: '@all',
              msgtype: 'text',
              agentid: Number(config.agentId),
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
}
