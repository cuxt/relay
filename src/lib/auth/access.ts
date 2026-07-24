import { createAccessControl } from 'better-auth/plugins/access'
import { ROLES } from '@/constants'

const statements = {
  user: [
    'create',
    'list',
    'set-role',
    'ban',
    'impersonate',
    'impersonate-admins',
    'delete',
    'set-password',
    'set-email',
    'get',
    'update',
  ],
  session: ['list', 'revoke', 'delete'],
} as const

export const authAccessControl = createAccessControl(statements)

export const authRoles = {
  [ROLES.USER]: authAccessControl.newRole({ user: [], session: [] }),
  [ROLES.ADMIN]: authAccessControl.newRole({
    user: [
      'create',
      'list',
      'ban',
      'impersonate',
      'delete',
      'set-password',
      'set-email',
      'get',
      'update',
    ],
    session: ['list', 'revoke', 'delete'],
  }),
  [ROLES.SUPER]: authAccessControl.newRole(statements),
}
