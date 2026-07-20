import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const mode = useThemeStore((s) => s.mode)
  const resolvedMode = useThemeStore((s) => s.resolvedMode)
  const preset = useThemeStore((s) => s.preset)
  const initialized = useThemeStore((s) => s.initialized)
  const setMode = useThemeStore((s) => s.setMode)
  const setPreset = useThemeStore((s) => s.setPreset)
  const init = useThemeStore((s) => s.init)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [init, initialized])

  return { mode, resolvedMode, preset, setMode, setPreset }
}
