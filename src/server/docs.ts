import { openapi } from '@elysia/openapi'
import { apiInfo } from './meta'

export const docs = openapi({
  path: '/openapi',
  specPath: '/openapi/elysia-json',
  documentation: {
    info: apiInfo,
    tags: [
      { name: '更新日志', description: '本地版本记录' },
      { name: '邮箱', description: '管理员邮件传输配置与发送' },
      { name: '存储', description: '对象存储配置与上传地址签发' },
    ],
  },
  scalar: {
    url: '/openapi/json',
    metaData: {
      title: apiInfo.title,
      description: apiInfo.description,
    },
  },
})
