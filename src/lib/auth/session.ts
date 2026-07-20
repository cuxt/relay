import { authClient } from '@/lib/auth/client'

export type Session = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>
export const sessionKey = ['auth', 'session'] as const

export async function getSession() {
  const { data, error } = await authClient.getSession()

  if (error) {
    throw error
  }

  return data as Session | null
}
