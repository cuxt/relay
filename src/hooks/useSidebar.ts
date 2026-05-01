import { useEffect } from 'react'
import { useSidebarStore } from '@/stores/sidebarStore'

export function useSidebarCollapsed() {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const ready = useSidebarStore((s) => s.ready)
  const toggle = useSidebarStore((s) => s.toggle)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)

  return { collapsed, ready, toggle, setCollapsed }
}