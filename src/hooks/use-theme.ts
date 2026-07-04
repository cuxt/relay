import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

export function useTheme() {
  const mode = useThemeStore((s) => s.mode)
  const resolvedMode = useThemeStore((s) => s.resolvedMode)
  const initialized = useThemeStore((s) => s.initialized)
  const setMode = useThemeStore((s) => s.setMode)
  const init = useThemeStore((s) => s.init)

  useEffect(() => {
    if (!initialized) {
      init()
    }
  }, [init, initialized])

  return { mode, resolvedMode, setMode }
}
