import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function subscribeSystemTheme(callback: () => void) {
  mediaQuery?.addEventListener('change', callback)
  return () => mediaQuery?.removeEventListener('change', callback)
}

function getSystemThemeSnapshot(): 'light' | 'dark' {
  return mediaQuery?.matches ? 'dark' : 'light'
}

function getSystemThemeServerSnapshot(): 'light' | 'dark' {
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')

  // Sync from localStorage after hydration to avoid mismatch
  useEffect(() => {
    const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    if (storedMode) setModeState(storedMode)
  }, [])

  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot
  )

  const resolvedMode = mode === 'system' ? systemTheme : mode

  // Apply dark class to html element
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolvedMode === 'dark')
    document.documentElement.setAttribute('data-theme', resolvedMode)
  }

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('theme-mode', m)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
