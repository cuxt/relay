// --- AST Node Types ---

export interface TextNode {
  type: 'text'
  value: string
}
export interface VarNode {
  type: 'var'
  key: string
}
export interface AiNode {
  type: 'ai'
  presetKey: string
  input: (TextNode | VarNode)[]
}
export type TemplateNode = TextNode | VarNode | AiNode

// --- Parser ---

/** 解析内层（AiNode 内部），只产生 TextNode | VarNode */
function parseInner(s: string): (TextNode | VarNode)[] {
  const nodes: (TextNode | VarNode)[] = []
  let i = 0
  let text = ''

  while (i < s.length) {
    if (s[i] === '$' && s[i + 1] === '{') {
      if (text) {
        nodes.push({ type: 'text', value: text })
        text = ''
      }
      const start = i + 2
      let j = start
      while (j < s.length && s[j] !== '}') j++
      if (j < s.length) {
        nodes.push({ type: 'var', key: s.slice(start, j).trim() })
        i = j + 1
      } else {
        // 未闭合，当作文本
        text += '${'
        i = start
      }
    } else {
      text += s[i]
      i++
    }
  }

  if (text) nodes.push({ type: 'text', value: text })
  return nodes
}

/** 单遍字符扫描，生成 AST */
export function parse(template: string): TemplateNode[] {
  const nodes: TemplateNode[] = []
  let i = 0
  let text = ''

  while (i < template.length) {
    if (template[i] === '$' && template[i + 1] === '{') {
      if (text) {
        nodes.push({ type: 'text', value: text })
        text = ''
      }

      const exprStart = i + 2

      // 检查 ai.KEY( 模式
      const aiMatch = template.slice(exprStart).match(/^ai\.([a-zA-Z_]+)\(/)
      if (aiMatch) {
        const presetKey = aiMatch[1]
        const contentStart = exprStart + aiMatch[0].length
        // 用平衡括号深度找到对应的 ')'
        let depth = 1
        let j = contentStart
        while (j < template.length && depth > 0) {
          if (template[j] === '(') depth++
          else if (template[j] === ')') depth--
          if (depth > 0) j++
        }

        if (depth === 0) {
          const innerContent = template.slice(contentStart, j)
          // j 现在指向 ')'，期望下一个是 '}'
          if (template[j + 1] === '}') {
            nodes.push({
              type: 'ai',
              presetKey,
              input: parseInner(innerContent)
            })
            i = j + 2
            continue
          }
        }
        // 容错：不匹配则当文本处理
        text += '${'
        i = exprStart
        continue
      }

      // 普通变量 VarNode
      let j = exprStart
      while (j < template.length && template[j] !== '}') j++
      if (j < template.length) {
        nodes.push({ type: 'var', key: template.slice(exprStart, j).trim() })
        i = j + 1
      } else {
        // 未闭合
        text += '${'
        i = exprStart
      }
    } else {
      text += template[i]
      i++
    }
  }

  if (text) nodes.push({ type: 'text', value: text })
  return nodes
}

// --- Query Functions ---

/** 递归收集所有 body.xxx 路径，去重 */
export function extractBodyPaths(nodes: TemplateNode[]): string[] {
  const paths = new Set<string>()

  function collect(n: TemplateNode | TextNode | VarNode) {
    if (n.type === 'var' && n.key.startsWith('body.')) {
      paths.add(n.key.slice(5))
    } else if (n.type === 'ai') {
      for (const child of n.input) collect(child)
    }
  }

  for (const n of nodes) collect(n)
  return [...paths]
}

/** 检查是否包含 AI 调用 */
export function hasAiCalls(nodes: TemplateNode[]): boolean {
  return nodes.some(n => n.type === 'ai')
}

// --- Resolve ---

export interface ResolveContext {
  body: unknown
  ip?: string
  userAgent?: string
}

/** 从对象中根据路径获取值 */
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

/** 解析单个变量 */
function resolveVar(key: string, ctx: ResolveContext): string {
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
    default: {
      // body.xxx 路径引用
      const fieldPath = key.startsWith('body.') ? key.slice(5) : key
      const value = getValueByPath(ctx.body, fieldPath)
      if (value === undefined || value === null) return `\${${key}}`
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    }
  }
}

/** 解析一组 inner nodes 为字符串（变量替换） */
function resolveInnerNodes(
  nodes: (TextNode | VarNode)[],
  ctx: ResolveContext
): string {
  return nodes
    .map(n => (n.type === 'text' ? n.value : resolveVar(n.key, ctx)))
    .join('')
}

/** 同步求值：变量替换，AiNode → 空字符串（客户端预览用） */
export function resolveSync(
  nodes: (TemplateNode | TextNode | VarNode)[],
  ctx: ResolveContext
): string {
  return nodes
    .map(n => {
      if (n.type === 'text') return n.value
      if (n.type === 'var') return resolveVar(n.key, ctx)
      return '' // AiNode → empty
    })
    .join('')
}

// --- Async Resolve with AI ---

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

/** 异步完整求值（变量 + AI），自动去重 */
export async function resolve(
  nodes: TemplateNode[],
  ctx: ResolveContext,
  aiResolver?: AiResolver
): Promise<ResolveResult> {
  if (!aiResolver || !hasAiCalls(nodes)) {
    return { message: resolveSync(nodes, ctx), aiMeta: [] }
  }

  // 1. 收集 AI 调用，解析 input 中的变量
  const aiEntries: {
    index: number
    presetKey: string
    resolvedInput: string
  }[] = []

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    if (n.type === 'ai') {
      aiEntries.push({
        index: i,
        presetKey: n.presetKey,
        resolvedInput: resolveInnerNodes(n.input, ctx)
      })
    }
  }

  // 2. 去重：按 presetKey + resolvedInput
  const dedupeMap = new Map<
    string,
    { presetKey: string; resolvedInput: string }
  >()
  for (const entry of aiEntries) {
    const key = `${entry.presetKey}\0${entry.resolvedInput}`
    if (!dedupeMap.has(key)) {
      dedupeMap.set(key, {
        presetKey: entry.presetKey,
        resolvedInput: entry.resolvedInput
      })
    }
  }

  // 3. 并行执行去重后的唯一调用
  const uniqueKeys = [...dedupeMap.keys()]
  const uniqueEntries = [...dedupeMap.values()]
  const metaList: AiCallMeta[] = []

  const results = await Promise.all(
    uniqueEntries.map(async ({ presetKey, resolvedInput }) => {
      const startTime = Date.now()
      try {
        const output = await aiResolver(presetKey, resolvedInput)
        const meta: AiCallMeta = {
          presetKey,
          input: resolvedInput,
          output,
          latencyMs: Date.now() - startTime,
          error: null
        }
        metaList.push(meta)
        return output
      } catch (err: any) {
        const meta: AiCallMeta = {
          presetKey,
          input: resolvedInput,
          output: '',
          latencyMs: Date.now() - startTime,
          error: err.message || 'AI 处理失败'
        }
        metaList.push(meta)
        return ''
      }
    })
  )

  // 4. 构建 key→result 映射
  const resultMap = new Map<string, string>()
  for (let i = 0; i < uniqueKeys.length; i++) {
    resultMap.set(uniqueKeys[i], results[i])
  }

  // 5. 拼装最终消息
  const parts: string[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      parts.push(n.value)
    } else if (n.type === 'var') {
      parts.push(resolveVar(n.key, ctx))
    } else {
      const resolvedInput = resolveInnerNodes(n.input, ctx)
      const key = `${n.presetKey}\0${resolvedInput}`
      parts.push(resultMap.get(key) || '')
    }
  }

  return { message: parts.join(''), aiMeta: metaList }
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
    token: '${body}',
    label: 'body',
    description: '请求体字段，如 ${body.content}',
    category: 'builtin'
  },
  {
    token: '${datetime}',
    label: 'datetime',
    description: '当前日期时间 (YYYY-MM-DD HH:mm:ss)',
    category: 'builtin'
  },
  {
    token: '${date}',
    label: 'date',
    description: '当前日期 (YYYY-MM-DD)',
    category: 'builtin'
  },
  {
    token: '${time}',
    label: 'time',
    description: '当前时间 (HH:mm:ss)',
    category: 'builtin'
  },
  {
    token: '${timestamp}',
    label: 'timestamp',
    description: 'Unix 时间戳（秒）',
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
    token: '${json}',
    label: 'json',
    description: '完整请求体 JSON 字符串',
    category: 'builtin'
  },
  {
    token: '${ai.()}',
    label: 'ai.()',
    description: 'AI 调用，如 ${ai.translate(${body.content})}',
    category: 'ai',
    cursorOffset: 3
  }
]
