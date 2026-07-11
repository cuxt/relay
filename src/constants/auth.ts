/**
 * 认证相关常量
 */
export const AUTH = {
  /** 密码最小长度 */
  PASSWORD_MIN_LENGTH: 8,
  /** 生成的随机密码长度 */
  GENERATED_PASSWORD_LENGTH: 16,

  /** 会话过期时间（7 天，单位秒） */
  SESSION_EXPIRES_IN: 60 * 60 * 24 * 7,
  /** 会话更新间隔（24 小时，单位秒） */
  SESSION_UPDATE_AGE: 60 * 60 * 24,
  /** Cookie 缓存最大有效期（5 分钟，单位秒） */
  COOKIE_CACHE_MAX_AGE: 5 * 60,
} as const
