import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { endpoint } from '@/db/schemas/endpoint.schema'
import { channel } from '@/db/schemas/channel.schema'
import { eq } from 'drizzle-orm'
import { replaceTemplate } from '@/lib/utils/template'
import { sendMessage } from '@/lib/channel/sender'

export const Route = createFileRoute('/api/push/$id')({
  server: {
    handlers: {
      POST: async ({
        request,
        params
      }: {
        request: Request
        params: { id: string }
      }) => {
        try {
          // 查询endpoint及其关联的channel
          const result = await db
            .select({
              endpoint: {
                id: endpoint.id,
                name: endpoint.name,
                config: endpoint.config,
                status: endpoint.status
              },
              channel: {
                id: channel.id,
                name: channel.name,
                type: channel.type,
                config: channel.config,
                status: channel.status
              }
            })
            .from(endpoint)
            .innerJoin(channel, eq(endpoint.channelId, channel.id))
            .where(eq(endpoint.id, params.id))
            .limit(1)

          // 检查endpoint是否存在
          if (result.length === 0) {
            return new Response(
              JSON.stringify({ error: 'Endpoint not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
          }

          const { endpoint: endpointData, channel: channelData } = result[0]

          // 检查endpoint和channel状态
          if (endpointData.status !== 'active') {
            return new Response(
              JSON.stringify({ error: 'Endpoint is inactive' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
          }

          if (channelData.status !== 'active') {
            return new Response(
              JSON.stringify({ error: 'Channel is inactive' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // 解析请求体
          let requestBody: any = {}
          try {
            requestBody = await request.json()
          } catch (err) {
            // 如果解析失败，使用空对象
          }

          // 获取endpoint配置
          const endpointConfig = endpointData.config as any
          if (!endpointConfig || !endpointConfig.content) {
            return new Response(
              JSON.stringify({ error: 'Endpoint configuration invalid' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
          }

          // 替换模板中的占位符
          const messageContent = replaceTemplate(endpointConfig.content, {
            body: requestBody
          })

          // 根据渠道类型构建消息参数
          let messageOptions: any = messageContent

          // 如果是企业微信渠道，添加 mentioned_list 和 mentioned_mobile_list
          if (channelData.type === 'wecom') {
            messageOptions = {
              content: messageContent
            }
            if (endpointConfig.mentioned_list && endpointConfig.mentioned_list.length > 0) {
              messageOptions.mentioned_list = endpointConfig.mentioned_list
            }
            if (endpointConfig.mentioned_mobile_list && endpointConfig.mentioned_mobile_list.length > 0) {
              messageOptions.mentioned_mobile_list = endpointConfig.mentioned_mobile_list
            }
          }

          // 发送消息
          await sendMessage(
            channelData.type,
            channelData.config,
            messageOptions
          )

          // 返回成功响应
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Message sent successfully'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Push error:', error)
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Internal error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }
    }
  }
})
