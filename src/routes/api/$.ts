import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/server/api'

const handleApiRequest = ({ request }: { request: Request }) => api.handle(request)

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: handleApiRequest,
      POST: handleApiRequest,
      PUT: handleApiRequest,
      PATCH: handleApiRequest,
      DELETE: handleApiRequest,
      OPTIONS: handleApiRequest,
      HEAD: handleApiRequest,
    },
  },
})
