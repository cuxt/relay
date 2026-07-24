import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ROUTES, isAdmin } from '@/constants'

export const Route = createFileRoute('/_user/_admin')({
  beforeLoad: async ({ context }) => {
    if (!isAdmin(context.user.role)) {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
