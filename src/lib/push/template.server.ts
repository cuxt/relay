import vm from 'node:vm'
import dayjs from 'dayjs'
import type { ResolveContext, AiResolver, AiCallMeta, ResolveResult } from './template'

/**
 * 使用 vm 沙箱执行模板字符串。
 */
export async function evaluate(
  template: string,
  ctx: ResolveContext,
  aiResolver?: AiResolver
): Promise<ResolveResult> {
  const aiMeta: AiCallMeta[] = []

  // AI 去重缓存
  const aiCache = new Map<string, Promise<string>>()

  const ai = async (presetKey: string, input: string): Promise<string> => {
    if (!aiResolver) return ''
    const cacheKey = `${presetKey}\0${input}`
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey)!

    const promise = (async () => {
      const startTime = Date.now()
      try {
        const output = await aiResolver(presetKey, input)
        aiMeta.push({
          presetKey,
          input,
          output,
          latencyMs: Date.now() - startTime,
          error: null
        })
        return output
      } catch (err: any) {
        aiMeta.push({
          presetKey,
          input,
          output: '',
          latencyMs: Date.now() - startTime,
          error: err.message || 'AI 处理失败'
        })
        return ''
      }
    })()

    aiCache.set(cacheKey, promise)
    return promise
  }

  // 构建沙箱上下文
  const sandbox: Record<string, unknown> = {
    // 用户数据
    payload: ctx.payload,
    ip: ctx.ip || '',
    ua: ctx.userAgent || '',
    // 时间库
    dayjs,
    // AI 函数
    ai,
    // 安全内置
    JSON,
    Math,
    String,
    Number,
    Array,
    Object,
    Date,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent
  }

  // 转义模板中的反引号，防止破坏模板字面量包裹
  const escaped = template.replace(/`/g, '\\`')
  const code = `(async () => \`${escaped}\`)()`

  try {
    const raw = String(await vm.runInNewContext(code, sandbox, { timeout: 300000 }))
    // 折叠连续空行为最多一个空行，并去除首尾空白
    const message = raw.replace(/\n{3,}/g, '\n\n').trim()
    return { message, aiMeta }
  } catch (err: any) {
    return { message: `[模板错误: ${err.message}]`, aiMeta }
  }
}
