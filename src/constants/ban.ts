/**
 * 封禁时长选项
 * value 为秒数或 'permanent'（永久）
 */
export const BAN_DURATIONS = [
  { label: '1 小时', value: '3600' },
  { label: '24 小时', value: '86400' },
  { label: '7 天', value: '604800' },
  { label: '30 天', value: '2592000' },
  { label: '永久', value: 'permanent' },
] as const
