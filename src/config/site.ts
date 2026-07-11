/**
 * 站点配置 — 集中管理品牌信息，避免硬编码散落各处
 */

export const siteConfig = {
  /** 站点名称，用于 Logo、标题、版权等 */
  name: import.meta.env.VITE_SITE_NAME || 'Relay',
  /** 站点描述，用于 meta */
  description: '自部署的多渠道消息推送服务',
} as const
