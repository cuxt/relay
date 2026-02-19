export function jsonResponse<T>(data: T, status = 200) {
  if (status === 204) {
    return new Response(null, { status: 204 })
  }
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function errorResponse(code: string, message: string, status = 400) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
