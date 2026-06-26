import { openapi } from '@elysia/openapi'
import { apiInfo } from './meta'

export const docs = openapi({
  path: '/openapi',
  specPath: '/openapi/elysia-json',
  documentation: {
    info: apiInfo,
    tags: [
      { name: '更新日志', description: '本地版本记录' },
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
