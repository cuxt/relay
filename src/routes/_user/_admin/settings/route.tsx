import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSystemInfo } from '@/lib/site-config/queries'
import { CACHE } from '@/constants'

export const Route = createFileRoute('/_user/_admin/settings')({
  beforeLoad: async () => {
    const systemInfo = await getSystemInfo()
    return { systemInfo }
  },
  staleTime: CACHE.SYSTEM_INFO_STALE_TIME,
  preloadStaleTime: CACHE.SYSTEM_INFO_STALE_TIME,
  component: SettingsLayout,
})

function SettingsLayout() {
  return <Outlet />
}
