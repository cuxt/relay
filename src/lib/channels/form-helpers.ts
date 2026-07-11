/**
 * 受控渠道表单的嵌套路径读写辅助（不依赖 react-hook-form）。
 *
 * 渠道 config 是按渠道类型变化的嵌套对象（如 email 的 `{ smtp: { host, port, ... }, resend: { apiKey } }`），
 * 各 fields 组件按点路径（`config.smtp.host`）读写具体字段。这里提供最小实现，
 * 让 channel-form 与 fields 组件在受控 state 下统一处理嵌套。
 */

/** 按点路径读取嵌套对象中的值 */
export function getIn(obj: Record<string, unknown> | undefined, path: string): unknown {
  if (!obj) return undefined
  const segments = path.split('.')
  let cur: unknown = obj
  for (const seg of segments) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[seg]
  }
  return cur
}

/** 按点路径写入嵌套对象，返回新对象引用（不就地修改） */
export function setIn<T extends Record<string, unknown>>(
  obj: T | undefined,
  path: string,
  value: unknown
): T {
  const segments = path.split('.')
  const next = { ...(obj ?? {}) } as Record<string, unknown>
  let cur: Record<string, unknown> = next
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    const child = cur[seg]
    const cloned =
      child && typeof child === 'object' ? { ...(child as Record<string, unknown>) } : {}
    cur[seg] = cloned
    cur = cloned
  }
  cur[segments[segments.length - 1]] = value
  return next as T
}

/** 把 zod 校验失败的问题（点路径）拍扁为 `{ fieldPath: message }` 映射 */
export function flattenZodErrors(
  issues: Array<{ path?: Array<string | number>; message: string }>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const key = (issue.path ?? []).map(String).join('.')
    if (!key) continue
    // 首条错误优先，避免被后覆盖
    if (!out[key]) out[key] = issue.message
  }
  return out
}
