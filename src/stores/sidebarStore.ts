import { create } from 'zustand'

interface SidebarStore {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggle: () => void
}

const key = 'sidebar-collapsed'

function readCollapsed() {
  if (typeof window === 'undefined') return false

  return localStorage.getItem(key) === 'true'
}

function saveCollapsed(value: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, String(value))
  }
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  collapsed: readCollapsed(),
  setCollapsed: (value: boolean) => {
    saveCollapsed(value)
    set({ collapsed: value })
  },
  toggle: () => {
    const value = !get().collapsed
    saveCollapsed(value)
    set({ collapsed: value })
  },
}))
