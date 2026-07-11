/**
 * 缓存 / Stale Time 常量
 * 集中管理 TanStack Query 和路由的缓存时间
 */
export const CACHE = {
  /** 默认查询 staleTime（5 分钟） */
  DEFAULT_STALE_TIME: 1000 * 60 * 5,
  /** 默认预加载 staleTime（30 秒） */
  DEFAULT_PRELOAD_STALE_TIME: 1000 * 30,
  /** Releases 查询 staleTime（30 分钟） */
  RELEASES_STALE_TIME: 1000 * 60 * 30,
  /** 用户路由上下文 staleTime（永不过期） */
  USER_ROUTE_STALE_TIME: Infinity,
} as const
