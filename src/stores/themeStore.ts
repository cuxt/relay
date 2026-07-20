import { create } from 'zustand'
import { isThemePreset, type ThemePreset } from '@/config/theme-presets'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeStore {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  preset: ThemePreset
  initialized: boolean
  setMode: (mode: ThemeMode) => void
  setPreset: (preset: ThemePreset) => void
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

function applyPreset(preset: ThemePreset) {
  document.documentElement.dataset.themePreset = preset
}

export const useThemeStore = create<ThemeStore>((set) => ({
  // Start with defaults to avoid hydration mismatch
  mode: 'system',
  resolvedMode: 'light',
  preset: 'default',
  initialized: false,

  setMode: (mode: ThemeMode) => {
    localStorage.setItem('theme-mode', mode)
    const resolved = mode === 'system' ? getSystemTheme() : mode
    set({ mode, resolvedMode: resolved })

    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.setAttribute('data-theme', resolved)
  },

  setPreset: (preset: ThemePreset) => {
    localStorage.setItem('theme-preset', preset)
    set({ preset })
    applyPreset(preset)
  },

  init: () => {
    const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    const initialMode = storedMode || 'system'
    const initialResolved = initialMode === 'system' ? getSystemTheme() : initialMode
    const storedPreset = localStorage.getItem('theme-preset')
    const initialPreset = isThemePreset(storedPreset) ? storedPreset : 'default'

    set({
      mode: initialMode,
      resolvedMode: initialResolved,
      preset: initialPreset,
      initialized: true,
    })

    document.documentElement.classList.toggle('dark', initialResolved === 'dark')
    document.documentElement.setAttribute('data-theme', initialResolved)
    applyPreset(initialPreset)
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
