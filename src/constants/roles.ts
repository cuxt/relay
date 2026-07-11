/**
 * 用户角色常量
 * 集中管理角色标识，避免字符串硬编码散落各处
 */
export const ROLES = {
  /** 管理员 */
  ADMIN: 'admin',
  /** 普通用户 */
  USER: 'user',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
