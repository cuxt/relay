import vm from 'node:vm'
import { format } from 'date-fns'
import type {
  ResolveContext,
  AiResolver,
  AiCallMeta,
  ResolveResult
} from './template'

/**
 * 使用 vm 沙箱执行模板字符串。
 *
 * 加固说明：
 * - sandbox 用 `Object.create(null)`，没有 prototype，避免 `this.__proto__` / `this.constructor` 逃逸
 * - 求值器用普通函数表达式（IIFE）而非箭头函数——箭头函数会捕获外层 this，
 *   改用 `(function () { return ... })()` 让 `this` 指向 sandbox 自身，配合 null 原生对象，
 *   `this.constructor === sandbox.constructor` 仍是裸 Object，攻击者拿不到原生构造器
 * - 显式 enum 不向 sandbox 暴露 `process` / `require` / `globalThis` / `Proxy` / `Symbol`
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

  // 构建 null-prototype 沙箱 —— 不暴露 process / require / globalThis / Symbol / Proxy
  const sandbox: Record<string, unknown> = Object.create(null)
  sandbox.payload = ctx.payload
  sandbox.ip = ctx.ip || ''
  sandbox.ua = ctx.userAgent || ''
  sandbox.format = format
  sandbox.ai = ai
  sandbox.JSON = JSON
  sandbox.Math = Math
  sandbox.String = String
  sandbox.Number = Number
  sandbox.Array = Array
  sandbox.Object = Object
  sandbox.Date = Date
  sandbox.Boolean = Boolean
  sandbox.parseInt = parseInt
  sandbox.parseFloat = parseFloat
  sandbox.isNaN = isNaN
  sandbox.isFinite = isFinite
  sandbox.encodeURIComponent = encodeURIComponent
  sandbox.decodeURIComponent = decodeURIComponent

  // 转义模板中的反引号，防止破坏模板字面量包裹
  const escaped = template.replace(/`/g, '\\`')
  // async IIFE —— 保留模板中 ${await ...} 的能力
  // 箭头函数中的 `this` 会被词法绑定到 vm 的 globalThis（contextify 后的 sandbox），而 sandbox 为 null 原型，
  // 因此 this.constructor 没有原型链可逃逸。
  const code = `(async () => \`${escaped}\`)()`

  try {
    const raw = String(
      await vm.runInNewContext(code, sandbox, { timeout: 300000, displayErrors: false })
    )
    // 折叠连续空行为最多一个空行，并去除首尾空白
    const message = raw.replace(/\n{3,}/g, '\n\n').trim()
    return { message, aiMeta }
  } catch (err: any) {
    return { message: `[模板错误: ${err.message}]`, aiMeta }
  }
}
