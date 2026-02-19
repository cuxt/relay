/**
 * 从对象中根据路径获取值
 */
export function getValueByPath(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let value: unknown = obj

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return value
}

/** 内置变量定义 */
export const TEMPLATE_BUILTINS: Array<{
  token: string
  label: string
  description: string
}> = [
  {
    token: '${body}',
    label: 'body',
    description: '请求体字段，如 ${body.content}'
  },
  {
    token: '${datetime}',
    label: 'datetime',
    description: '当前日期时间 (YYYY-MM-DD HH:mm:ss)'
  },
  { token: '${date}', label: 'date', description: '当前日期 (YYYY-MM-DD)' },
  { token: '${time}', label: 'time', description: '当前时间 (HH:mm:ss)' },
  {
    token: '${timestamp}',
    label: 'timestamp',
    description: 'Unix 时间戳（秒）'
  },
  { token: '${ip}', label: 'ip', description: '请求来源 IP' },
  { token: '${ua}', label: 'ua', description: '请求 User-Agent' },
  { token: '${json}', label: 'json', description: '完整请求体 JSON 字符串' }
]

/** 解析内置变量 */
function resolveBuiltin(key: string, ctx: TemplateContext): string | undefined {
  const now = new Date()
  const tz = 'Asia/Shanghai'
  switch (key) {
    case 'datetime':
      return now.toLocaleString('zh-CN', { timeZone: tz, hour12: false })
    case 'date':
      return now.toLocaleDateString('sv-SE', { timeZone: tz })
    case 'time':
      return now.toLocaleTimeString('zh-CN', {
        timeZone: tz,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    case 'timestamp':
      return Math.floor(now.getTime() / 1000).toString()
    case 'ip':
      return ctx.ip || ''
    case 'ua':
      return ctx.userAgent || ''
    case 'json':
      return typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body)
    default:
      return undefined
  }
}

export interface TemplateContext {
  body: unknown
  ip?: string
  userAgent?: string
}

/**
 * 替换模板字符串中的 ${...} 占位符
 * 支持 ${body.xxx} 引用请求体字段和内置变量
 */
export function replaceTemplate(
  template: string,
  data: unknown,
  ctx?: Omit<TemplateContext, 'body'>
): string {
  const regex = /\$\{([^}]+)\}/g
  const fullCtx: TemplateContext = { body: data, ...ctx }

  return template.replace(regex, (match, rawPath) => {
    const path = rawPath.trim()

    // 尝试内置变量
    const builtin = resolveBuiltin(path, fullCtx)
    if (builtin !== undefined) return builtin

    // body.xxx 路径引用 — data 本身就是 body，剥离 "body." 前缀
    const fieldPath = path.startsWith('body.') ? path.slice(5) : path
    const value = getValueByPath(data, fieldPath)

    if (value === undefined || value === null) {
      return match
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  })
}
