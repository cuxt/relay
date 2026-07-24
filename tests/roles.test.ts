import { describe, expect, test } from 'bun:test'
import { ROLES, canManage, isActiveSuper, isAdmin, isSuper, roleLabel } from '@/constants'
import { authRoles } from '@/lib/auth/access'

describe('role hierarchy', () => {
  test('recognizes admin-level roles', () => {
    expect(isAdmin(ROLES.USER)).toBe(false)
    expect(isAdmin(ROLES.ADMIN)).toBe(true)
    expect(isAdmin(ROLES.SUPER)).toBe(true)
    expect(isSuper(ROLES.SUPER)).toBe(true)
    expect(isSuper(ROLES.ADMIN)).toBe(false)
  })

  test('limits administrators to ordinary users', () => {
    expect(canManage(ROLES.ADMIN, ROLES.USER)).toBe(true)
    expect(canManage(ROLES.ADMIN, ROLES.ADMIN)).toBe(false)
    expect(canManage(ROLES.ADMIN, ROLES.SUPER)).toBe(false)
    expect(canManage(ROLES.SUPER, ROLES.USER)).toBe(true)
    expect(canManage(ROLES.SUPER, ROLES.ADMIN)).toBe(true)
    expect(canManage(ROLES.SUPER, ROLES.SUPER)).toBe(true)
  })

  test('provides stable display labels', () => {
    expect(roleLabel(ROLES.USER)).toBe('普通用户')
    expect(roleLabel(ROLES.ADMIN)).toBe('管理员')
    expect(roleLabel(ROLES.SUPER)).toBe('超级管理员')
    expect(roleLabel(undefined)).toBe('普通用户')
  })
})

describe('usable super administrator', () => {
  const now = new Date('2026-07-23T00:00:00.000Z').getTime()

  test('accepts active and expired-ban super administrators', () => {
    expect(isActiveSuper({ role: ROLES.SUPER, banned: false }, now)).toBe(true)
    expect(
      isActiveSuper(
        { role: ROLES.SUPER, banned: true, banExpires: '2026-07-22T00:00:00.000Z' },
        now
      )
    ).toBe(true)
  })

  test('rejects active bans and non-super roles', () => {
    expect(isActiveSuper({ role: ROLES.ADMIN, banned: false }, now)).toBe(false)
    expect(isActiveSuper({ role: ROLES.SUPER, banned: true }, now)).toBe(false)
    expect(
      isActiveSuper(
        { role: ROLES.SUPER, banned: true, banExpires: '2026-07-24T00:00:00.000Z' },
        now
      )
    ).toBe(false)
  })
})

describe('Better Auth permissions', () => {
  test('keeps role assignment exclusive to super administrators', () => {
    expect(authRoles.admin.authorize({ user: ['create'] }).success).toBe(true)
    expect(authRoles.admin.authorize({ user: ['set-role'] }).success).toBe(false)
    expect(authRoles.admin.authorize({ user: ['impersonate-admins'] }).success).toBe(false)
    expect(authRoles.super.authorize({ user: ['set-role'] }).success).toBe(true)
    expect(authRoles.super.authorize({ user: ['impersonate-admins'] }).success).toBe(true)
  })
})
