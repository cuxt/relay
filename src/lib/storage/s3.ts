import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import type { S3Client } from '@aws-sdk/client-s3'
import type { StorageConfig } from '@/constants'

export interface PresignPutInput {
  client: S3Client
  config: StorageConfig
  key: string
  contentType?: string
  /** 默认 600 秒 */
  expires?: number
}

export interface PresignedUpload {
  /** 前端可直接 PUT 的签 URL */
  putUrl: string
  /** 对象 key（回写数据库用） */
  key: string
}

/** 生成上传预签名 URL */
export async function presignPut({
  client,
  config,
  key,
  contentType,
  expires = 600,
}: PresignPutInput): Promise<PresignedUpload> {
  const putUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: config.bucket, Key: key, ContentType: contentType }),
    { expiresIn: expires }
  )
  return { putUrl, key }
}

export interface AccessUrlInput {
  client: S3Client
  config: StorageConfig
  key: string
  /** 私桶预签名有效期（秒），默认 3600；公开桶忽略 */
  expires?: number
}

export interface AccessUrlResult {
  url: string
  /** 预签名到期时间戳（ms）；公开链接为 null */
  expiresAt: number | null
}

/**
 * 资源读 URL：配 publicBaseUrl 返回永久公开链接，否则签短期 GET。
 * 用于后端中转代理（/api/storage/object）即时签发，避免把会过期的 URL 落库。
 */
export async function accessUrl({
  client,
  config,
  key,
  expires = 3600,
}: AccessUrlInput): Promise<AccessUrlResult> {
  if (config.publicBaseUrl) {
    const base = config.publicBaseUrl.replace(/\/$/, '')
    return { url: `${base}/${key}`, expiresAt: null }
  }
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn: expires }
  )
  return { url, expiresAt: Date.now() + expires * 1000 }
}
