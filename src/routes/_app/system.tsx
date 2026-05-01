import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSystemInfo } from '@/lib/site-config/queries'

export const Route = createFileRoute('/_app/system')({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
    const systemInfo = await getSystemInfo()
    return { systemInfo }
  },
  component: SystemLayout,
})

function SystemLayout() {
  return <Outlet />
}
