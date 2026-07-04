/**
 * 路由路径常量
 * 集中管理所有路由路径，避免字符串硬编码散落各处
 */
export const ROUTES = {
  /** 首页 */
  HOME: '/',
  /** 控制台 */
  DASHBOARD: '/dashboard',
  /** 更新日志 */
  RELEASE: '/release',
  /** 登录 */
  LOGIN: '/login',
  /** 注册 */
  REGISTER: '/register',
  /** 个人设置 */
  PROFILE: '/profile',
  /** 用户管理（管理员） */
  USERS: '/users',
  /** 邮件设置（管理员） */
  EMAIL: '/email',
  /** 对象存储（管理员） */
  STORAGE: '/storage',
} as const
