import pkg from '../../package.json'
import { siteConfig } from '@/config/site'

const meta = pkg as { version: string }

export const apiInfo = {
  title: `${siteConfig.name} API`,
  version: meta.version,
  description: `${siteConfig.name} 的 Elysia 与 Better Auth 接口文档。`,
} as const
