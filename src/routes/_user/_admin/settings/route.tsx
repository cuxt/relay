import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSystemInfo } from '@/lib/site-config/queries'

export const Route = createFileRoute('/_user/_admin/settings')({
  beforeLoad: async () => {
    const systemInfo = await getSystemInfo()
    return { systemInfo }
  },
  component: SettingsLayout,
})

function SettingsLayout() {
  return <Outlet />
}