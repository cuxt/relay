import { S3Client } from '@aws-sdk/client-s3'
import type { StorageConfig } from '@/constants'

/** 根据配置构造 S3 兼容客户端 */
export function createStorageClient(cfg: StorageConfig): S3Client {
  return new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle ?? false,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  })
}
