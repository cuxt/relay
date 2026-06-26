import { create } from 'zustand'
import { UI } from '@/constants'

interface MobileStore {
  isMobile: boolean
  setIsMobile: (value: boolean) => void
}

const query = `(max-width: ${UI.MOBILE_BREAKPOINT - 1}px)`

function snapshot() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < UI.MOBILE_BREAKPOINT
}

export const useMobileStore = create<MobileStore>((set) => ({
  isMobile: snapshot(),
  setIsMobile: (value) => set({ isMobile: value }),
}))

if (typeof window !== 'undefined') {
  const mql = window.matchMedia(query)
  const sync = () => useMobileStore.setState({ isMobile: snapshot() })

  sync()
  mql.addEventListener('change', sync)

  import.meta.hot?.dispose(() => mql.removeEventListener('change', sync))
}
