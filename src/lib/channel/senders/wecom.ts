import type { WecomConfig, WecomTextMessageOptions } from '../types'

/**
 * 发送企业微信群机器人文本消息
 * @param config 企业微信配置
 * @param options 消息选项
 */
export async function sendWecomMessage(
  config: WecomConfig,
  options: WecomTextMessageOptions
): Promise<void> {
  const { webhook } = config

  // 构建消息体
  const message: {
    msgtype: 'text'
    text: {
      content: string
      mentioned_list?: string[]
      mentioned_mobile_list?: string[]
    }
  } = {
    msgtype: 'text',
    text: {
      content: options.content
    }
  }

  // 添加可选的 @ 提醒列表
  if (options.mentioned_list && options.mentioned_list.length > 0) {
    message.text.mentioned_list = options.mentioned_list
  }

  if (
    options.mentioned_mobile_list &&
    options.mentioned_mobile_list.length > 0
  ) {
    message.text.mentioned_mobile_list = options.mentioned_mobile_list
  }

  // 发送请求
  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`发送企业微信消息失败: ${error}`)
  }

  const result = await response.json()

  // 检查企业微信API返回的状态码
  if (result.errcode !== 0) {
    throw new Error(`企业微信API错误: ${result.errmsg || '未知错误'}`)
  }
}
