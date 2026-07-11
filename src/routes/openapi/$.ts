import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/server/api'
import { openApiSchema } from '@/server/openapi'

const handleOpenApi = ({ request }: { request: Request }) => {
  const pathname = new URL(request.url).pathname

  if (pathname === '/openapi/json') {
    return openApiSchema(request)
  }

  return api.handle(request)
}

export const Route = createFileRoute('/openapi/$')({
  server: {
    handlers: {
      GET: handleOpenApi,
    },
  },
})
