import {
  Home,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'

export interface MenuItem {
  key: string
  label: string
  icon?: ReactNode
  to?: string
  children?: MenuItem[]
  role?: 'admin' | 'user'
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
        to: '/dashboard',
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
        to: '/profile',
        group: '个人',
      },
    ],
  },
  {
    key: 'group-admin',
    label: '管理员',
    role: 'admin',
    children: [
      {
        key: 'settings-users',
        label: '用户管理',
        icon: <Users className="h-4 w-4" />,
        to: '/users',
        role: 'admin',
        group: '管理员',
      },
      {
        key: 'settings-system',
        label: '系统配置',
        icon: <Wrench className="h-4 w-4" />,
        to: '/settings',
        role: 'admin',
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
