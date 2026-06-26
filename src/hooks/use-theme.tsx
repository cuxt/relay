import { createContext, useEffect } from 'react'
import type { ReactNode } from 'react'
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

interface ThemeContextValue {
  mode: 'light' | 'dark' | 'system'
  resolvedMode: 'light' | 'dark'
  setMode: (mode: 'light' | 'dark' | 'system') => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, resolvedMode, setMode } = useTheme()

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
