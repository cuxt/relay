import { createFileRoute, redirect } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    throw redirect({ to: '/endpoints' })
  },
  server: {
    middleware: [authMiddleware]
  }
})
