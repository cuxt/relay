import { create } from 'zustand'
import { UI } from '@/constants'

interface MobileStore {
  isMobile: boolean
  setIsMobile: (value: boolean) => void
}

function subscribeMobile(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(`(max-width: ${UI.MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < UI.MOBILE_BREAKPOINT
}

export const useMobileStore = create<MobileStore>((set) => ({
  isMobile: getSnapshot(),
  setIsMobile: (value: boolean) => set({ isMobile: value }),
}))

// Initialize and subscribe to changes
if (typeof window !== 'undefined') {
  useMobileStore.setState({ isMobile: getSnapshot() })

  const mql = window.matchMedia(`(max-width: ${UI.MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', () => {
    useMobileStore.setState({ isMobile: getSnapshot() })
  })
}