/**
 * 端点令牌生成。
 * 从 relay 旧 src/lib/utils.ts 恢复——模板骨架的 utils.ts 只保留 cn()，
 * 这些业务函数独立成文件，避免污染模板骨架 utils.ts（上游同步时零冲突）。
 */

export function generateToken(prefix: string, length = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateEndpointToken(): string {
  return generateToken('rlk_')
}
