/**
 * 用户角色常量
 * 集中管理角色标识，避免字符串硬编码散落各处
 */
export const ROLES = {
  /** 超级管理员 */
  SUPER: 'super',
  /** 管理员 */
  ADMIN: 'admin',
  /** 普通用户 */
  USER: 'user',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER]: '超级管理员',
  [ROLES.ADMIN]: '管理员',
  [ROLES.USER]: '普通用户',
}

export function isRole(role: unknown): role is Role {
  return typeof role === 'string' && Object.values(ROLES).includes(role as Role)
}

export function isAdmin(role: unknown): role is typeof ROLES.ADMIN | typeof ROLES.SUPER {
  return role === ROLES.ADMIN || role === ROLES.SUPER
}

export function isSuper(role: unknown): role is typeof ROLES.SUPER {
  return role === ROLES.SUPER
}

export function canManage(actorRole: unknown, targetRole: unknown): boolean {
  if (isSuper(actorRole)) return true
  return actorRole === ROLES.ADMIN && (targetRole === ROLES.USER || targetRole == null)
}

export function roleLabel(role: unknown): string {
  return isRole(role) ? ROLE_LABELS[role] : ROLE_LABELS[ROLES.USER]
}

export function isActiveSuper(
  account: { role?: string | null; banned?: boolean | null; banExpires?: Date | string | null },
  now = Date.now()
): boolean {
  if (account.role !== ROLES.SUPER) return false
  if (!account.banned) return true
  return account.banExpires != null && new Date(account.banExpires).getTime() < now
}
