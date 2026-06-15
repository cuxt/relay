/**
 * 站点配置 — 集中管理品牌信息，避免硬编码散落各处
 */

export const siteConfig = {
  /** 站点名称，用于 Logo、标题、版权等 */
  name: import.meta.env.VITE_SITE_NAME || 'Start Template',
  /** 站点描述，用于 meta */
  description: '通用全栈起步模板',
} as const
