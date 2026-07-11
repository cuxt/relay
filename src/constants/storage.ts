import { t } from 'elysia'

/** 存储配置在 config KV 表中的 key */
export const STORAGE_CONFIG_KEY = 'storage_config'

/** 对象存储配置 TypeBox schema（运行时校验 + 类型 + OpenAPI 的单一来源） */
export const StorageConfigSchema = t.Object({
  /** 目前后端仅 S3 兼容，保留 union 以便未来扩展厂商 */
  transport: t.Literal('s3'),
  region: t.String(),
  bucket: t.String(),
  /** 自建 MinIO / R2 / 阿里 OSS S3 兼容端点，AWS S3 可留空 */
  endpoint: t.Optional(t.String()),
  accessKeyId: t.String(),
  secretAccessKey: t.String(),
  /** 资源访问域名（R2 自定义域名 / CDN），配则公开访问，不配则私读走预签名 GET */
  publicBaseUrl: t.Optional(t.String()),
  /** MinIO 等需 path-style，AWS S3 通常 false */
  forcePathStyle: t.Optional(t.Boolean()),
})

/** 对象存储配置 */
export type StorageConfig = typeof StorageConfigSchema.static
