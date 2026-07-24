import { Elysia, t } from 'elysia'
import { get, set } from '@/lib/config/kv'
import { STORAGE_CONFIG_KEY, StorageConfigSchema, type StorageConfig } from '@/constants'
import { createStorageClient } from '@/lib/storage/client'
import { accessUrl, presignPut } from '@/lib/storage/s3'
import { requireLogin, requireSuper } from '@/server/guards'

export const storageRoutes = new Elysia({ name: 'storage' })
  .use(requireSuper)
  .use(requireLogin)
  .get('/api/storage/config', async () => (await get<StorageConfig>(STORAGE_CONFIG_KEY)) ?? {}, {
    detail: {
      tags: ['存储'],
      summary: '获取对象存储配置',
    },
    requireSuper: true,
    response: {
      200: t.Union([StorageConfigSchema, t.Object({})]),
    },
  })
  .put(
    '/api/storage/config',
    async ({ body }) => {
      await set(STORAGE_CONFIG_KEY, body)
      return body
    },
    {
      detail: {
        tags: ['存储'],
        summary: '保存对象存储配置',
      },
      requireSuper: true,
      body: StorageConfigSchema,
      response: {
        200: StorageConfigSchema,
      },
    }
  )
  .post(
    '/api/storage/presign',
    async ({ body, status }) => {
      const cfg = await get<StorageConfig>(STORAGE_CONFIG_KEY)
      if (!cfg) return status(503, { error: '存储服务未配置' })
      const client = createStorageClient(cfg)
      const { putUrl, key } = await presignPut({
        client,
        config: cfg,
        key: body.key,
        contentType: body.contentType,
        expires: body.expires,
      })
      return { putUrl, key, accessUrl: `/api/storage/object?key=${encodeURIComponent(key)}` }
    },
    {
      detail: {
        tags: ['存储'],
        summary: '签发上传地址',
        description:
          '返回前端可直接 PUT 的预签名地址与稳定的资源访问地址（经服务端中转，永不过期）。',
      },
      requireLogin: true,
      body: t.Object({
        key: t.String(),
        contentType: t.Optional(t.String()),
        expires: t.Optional(t.Number()),
      }),
      response: {
        200: t.Object({
          putUrl: t.String(),
          accessUrl: t.String(),
          key: t.String(),
        }),
        503: t.Object({ error: t.String() }),
      },
    }
  )
  .get(
    '/api/storage/object',
    async ({ query, set, status }) => {
      const key = query.key
      const cfg = await get<StorageConfig>(STORAGE_CONFIG_KEY)
      if (!cfg) return status(503, { error: '存储服务未配置' })
      const client = createStorageClient(cfg)
      const { url, expiresAt } = await accessUrl({ client, config: cfg, key })
      set.headers['location'] = url
      // 公开链接永不过期，长缓存；私有桶签名有寿命，缓存不超过剩余有效期（留 60s 余量）
      const maxAge = expiresAt
        ? Math.max(60, Math.floor((expiresAt - Date.now()) / 1000) - 60)
        : 86400
      set.headers['cache-control'] = `public, max-age=${maxAge}`
      set.status = 302
      return ''
    },
    {
      detail: {
        tags: ['存储'],
        summary: '中转访问资源',
        description: '按对象 key 即时签发或拼接资源地址并 302 跳转，保证链接永不过期。',
      },
      query: t.Object({
        key: t.String(),
      }),
      response: {
        302: t.String(),
        503: t.Object({ error: t.String() }),
      },
    }
  )
