import { HardDrive, Home, Mail, User, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { ROLES, ROUTES, type Role } from '@/constants'

export interface MenuItem {
  key: string
  label: string
  icon?: ReactNode
  to?: string
  children?: MenuItem[]
  role?: Role
  external?: boolean
  group?: string
}

export const mainMenuItems: MenuItem[] = [
  {
    key: 'group-general',
    label: '常规',
    children: [
      {
        key: 'dashboard',
        label: '概述',
        icon: <Home className="h-4 w-4" />,
        to: ROUTES.DASHBOARD,
        group: '常规',
      },
    ],
  },
  {
    key: 'group-personal',
    label: '个人',
    children: [
      {
        key: 'settings-profile',
        label: '个人设置',
        icon: <User className="h-4 w-4" />,
        to: ROUTES.PROFILE,
        group: '个人',
      },
    ],
  },
  {
    key: 'group-admin',
    label: '管理员',
    role: ROLES.ADMIN,
    children: [
      {
        key: 'settings-users',
        label: '用户管理',
        icon: <Users className="h-4 w-4" />,
        to: ROUTES.USERS,
        role: ROLES.ADMIN,
        group: '管理员',
      },
      {
        key: 'settings-email',
        label: '邮件设置',
        icon: <Mail className="h-4 w-4" />,
        to: ROUTES.EMAIL,
        role: ROLES.ADMIN,
        group: '管理员',
      },
      {
        key: 'settings-storage',
        label: '对象存储',
        icon: <HardDrive className="h-4 w-4" />,
        to: ROUTES.STORAGE,
        role: ROLES.ADMIN,
        group: '管理员',
      },
    ],
  },
]

export function filterMenuByRole(items: MenuItem[], userRole?: string): MenuItem[] {
  return items
    .filter((item) => !item.role || item.role === userRole)
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRole(item.children, userRole) : undefined,
    }))
}
