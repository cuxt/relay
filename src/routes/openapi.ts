import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/server/api'

export const Route = createFileRoute('/openapi')({
  server: {
    handlers: {
      GET: ({ request }) => api.handle(request),
    },
  },
})
