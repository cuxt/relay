export const themePresets = [
  {
    value: 'default',
    label: '默认',
    swatches: ['oklch(0.6724 0.1308 38.7559)', 'oklch(0.65 0.1 60)'],
  },
  {
    value: 'anthropic',
    label: '暖陶',
    swatches: ['oklch(0.984 0.005 95)', 'oklch(0.685 0.142 38)'],
  },
  {
    value: 'underground',
    label: '地下森林',
    swatches: ['oklch(0.5315 0.0694 156.19)', 'oklch(0.5748 0.0862 336.52)'],
  },
  {
    value: 'rose-garden',
    label: '玫瑰花园',
    swatches: ['oklch(0.5827 0.2418 12.23)', 'oklch(0.8131 0.1129 5.67)'],
  },
  {
    value: 'lake-view',
    label: '湖光',
    swatches: ['oklch(0.765 0.177 163.22)', 'oklch(0.551 0.0899 200.52)'],
  },
  {
    value: 'sunset-glow',
    label: '落日余晖',
    swatches: ['oklch(0.5591 0.1882 25.33)', 'oklch(0.7938 0.1248 42.42)'],
  },
  {
    value: 'forest-whisper',
    label: '森林低语',
    swatches: ['oklch(0.5276 0.1072 182.22)', 'oklch(0.5236 0.0505 250.18)'],
  },
  {
    value: 'ocean-breeze',
    label: '海洋微风',
    swatches: ['oklch(0.5461 0.2152 262.88)', 'oklch(0.5854 0.2041 277.12)'],
  },
  {
    value: 'lavender-dream',
    label: '薰衣草梦',
    swatches: ['oklch(0.5709 0.1808 306.89)', 'oklch(0.811 0.0589 201.14)'],
  },
  {
    value: 'simple-large',
    label: '简约黑白',
    swatches: ['oklch(0.22 0 0)', 'oklch(0.82 0 0)'],
  },
] as const

export type ThemePreset = (typeof themePresets)[number]['value']

export function isThemePreset(value: string | null): value is ThemePreset {
  return themePresets.some((preset) => preset.value === value)
}
