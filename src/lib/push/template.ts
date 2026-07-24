// --- Types ---

export interface ResolveContext {
  payload: unknown
  ip?: string
  userAgent?: string
}

export type AiResolver = (presetKey: string, input: string) => Promise<string>

export interface AiCallMeta {
  presetKey: string
  input: string
  output: string
  latencyMs: number
  error: string | null
}

export interface ResolveResult {
  message: string
  aiMeta: AiCallMeta[]
}

// --- Utility ---

/**
 * 从模板字符串中正则提取 payload.xxx 路径，去重。
 * 匹配 payload. 后跟点分路径（支持可选链 ?.）。
 */
export function extractBodyPaths(template: string): string[] {
  const paths = new Set<string>()
  // 匹配 payload.xxx 或 payload?.xxx 形式，提取点分路径
  const re = /payload\??\.([\w]+(?:\??\.\w+)*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(template)) !== null) {
    // 去掉可选链符号 ?
    const clean = m[1].replace(/\?/g, '')
    paths.add(clean)
  }
  return [...paths]
}

// --- Template Tokens ---

export interface TemplateToken {
  token: string
  label: string
  description: string
  category: 'builtin' | 'ai'
  cursorOffset?: number
}

export const TEMPLATE_TOKENS: TemplateToken[] = [
  {
    token: '${payload}',
    label: 'payload',
    description: '请求体字段，如 ${payload.content}',
    category: 'builtin'
  },
  {
    token: "${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}",
    label: 'format()',
    description: "date-fns 时间格式化，如 ${format(new Date(payload.time), 'yyyy-MM-dd')}",
    category: 'builtin'
  },
  {
    token: '${ip}',
    label: 'ip',
    description: '请求来源 IP',
    category: 'builtin'
  },
  {
    token: '${ua}',
    label: 'ua',
    description: '请求 User-Agent',
    category: 'builtin'
  },
  {
    token: "${await ai('', )}",
    label: 'ai()',
    description: "AI 调用，如 ${await ai('translate', payload.content)}",
    category: 'ai',
    cursorOffset: 4
  }
]
