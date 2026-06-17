import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ROLES, ROUTES } from '@/constants'

export const Route = createFileRoute('/_user/_admin')({
  beforeLoad: async ({ context }) => {
    if (context.user.role !== ROLES.ADMIN) {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
