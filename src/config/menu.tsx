import {
  Home,
  Settings,
  User,
  Lock,
  Users,
  Wrench,
  Bubbles,
  MessageCircle,
  HelpCircle,
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
}

export const mainMenuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '首页',
    icon: <Home className="h-4 w-4" />,
    to: '/dashboard',
  },
  {
    key: 'settings',
    label: '设置',
    icon: <Settings className="h-4 w-4" />,
    children: [
      {
        key: 'settings-profile',
        label: '个人资料',
        icon: <User className="h-4 w-4" />,
        to: '/settings',
      },
      {
        key: 'settings-security',
        label: '安全',
        icon: <Lock className="h-4 w-4" />,
        to: '/settings/security',
      },
      {
        key: 'settings-users',
        label: '用户管理',
        icon: <Users className="h-4 w-4" />,
        to: '/settings/users',
        role: 'admin',
      },
      {
        key: 'settings-system',
        label: '系统配置',
        icon: <Wrench className="h-4 w-4" />,
        to: '/settings/system',
        role: 'admin',
      },
    ],
  },
]

export const footerMenuItems: MenuItem[] = [
  {
    key: 'release',
    label: '更新日志',
    icon: <Bubbles className="h-4 w-4" />,
    to: '/release',
  },
  {
    key: 'feedback',
    label: '反馈',
    icon: <MessageCircle className="h-4 w-4" />,
    to: 'https://github.com',
    external: true,
  },
  {
    key: 'help',
    label: '帮助与支持',
    icon: <HelpCircle className="h-4 w-4" />,
    to: 'https://github.com',
    external: true,
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
