import { create } from 'zustand'

interface SidebarStore {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  collapsed: true,
  setCollapsed: (value: boolean) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    set({ collapsed: value })
  },
  toggle: () => {
    const newValue = !get().collapsed
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue))
    set({ collapsed: newValue })
  },
}))

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
  // 未设置时默认折叠
  const isCollapsed = stored === null ? true : stored === 'true'
  useSidebarStore.setState({ collapsed: isCollapsed })
}
