import { create } from 'zustand'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeStore {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  initialized: boolean
  setMode: (mode: ThemeMode) => void
  init: () => void
}

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function getSystemTheme(): 'light' | 'dark' {
  return mediaQuery?.matches ? 'dark' : 'light'
}

function subscribeSystemTheme(callback: () => void) {
  mediaQuery?.addEventListener('change', callback)
  return () => mediaQuery?.removeEventListener('change', callback)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Start with defaults to avoid hydration mismatch
  mode: 'system',
  resolvedMode: 'light',
  initialized: false,

  setMode: (mode: ThemeMode) => {
    localStorage.setItem('theme-mode', mode)
    const resolved = mode === 'system' ? getSystemTheme() : mode
    set({ mode, resolvedMode: resolved })

    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.setAttribute('data-theme', resolved)
  },

  init: () => {
    const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    const initialMode = storedMode || 'system'
    const initialResolved = initialMode === 'system' ? getSystemTheme() : initialMode

    set({ mode: initialMode, resolvedMode: initialResolved, initialized: true })

    document.documentElement.classList.toggle('dark', initialResolved === 'dark')
    document.documentElement.setAttribute('data-theme', initialResolved)
  },
}))

// Subscribe to system theme changes
if (typeof window !== 'undefined') {
  subscribeSystemTheme(() => {
    const { mode, initialized } = useThemeStore.getState()
    if (mode === 'system' && initialized) {
      const resolved = getSystemTheme()
      useThemeStore.setState({ resolvedMode: resolved })
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }
  })
}