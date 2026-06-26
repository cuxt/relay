import pkg from '../../package.json'

const meta = pkg as { name: string; version: string; description?: string }
const description = meta.description || 'TanStack Start 模板的 Elysia 与 Better Auth 接口文档。'

export const apiInfo = {
  title: `${meta.name} API`,
  version: meta.version,
  description,
} as const
