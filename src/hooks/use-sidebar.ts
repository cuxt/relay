import { useSidebarStore } from '@/stores/sidebarStore'

export function useSidebarCollapsed() {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)

  return { collapsed, toggle, setCollapsed }
}
