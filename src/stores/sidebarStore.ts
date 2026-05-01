import { create } from 'zustand'

interface SidebarStore {
  collapsed: boolean
  ready: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
  setReady: (value: boolean) => void
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  collapsed: false,
  ready: false,
  setCollapsed: (value: boolean) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    set({ collapsed: value })
    window.dispatchEvent(new Event('sidebar-collapse-change'))
  },
  toggle: () => {
    const newValue = !get().collapsed
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue))
    set({ collapsed: newValue })
    window.dispatchEvent(new Event('sidebar-collapse-change'))
  },
  setReady: (value: boolean) => set({ ready: value }),
}))

// Initialize sidebar state from localStorage on client
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
  const isCollapsed = stored === 'true'
  useSidebarStore.setState({ collapsed: isCollapsed, ready: true })
}