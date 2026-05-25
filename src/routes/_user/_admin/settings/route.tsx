import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getSystemInfo } from '@/lib/site-config/queries'

const SYSTEM_INFO_STALE_TIME = 1000 * 60

export const Route = createFileRoute('/_user/_admin/settings')({
  beforeLoad: async () => {
    const systemInfo = await getSystemInfo()
    return { systemInfo }
  },
  staleTime: SYSTEM_INFO_STALE_TIME,
  preloadStaleTime: SYSTEM_INFO_STALE_TIME,
  component: SettingsLayout,
})

function SettingsLayout() {
  return <Outlet />
}
