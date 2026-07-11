import { redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth/client'
import { ROUTES } from '@/constants'

export type Session = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>
export const sessionKey = ['auth', 'session'] as const

export async function getSession() {
  const { data, error } = await authClient.getSession()

  if (error) {
    throw error
  }

  return data as Session | null
}

export async function requireSession() {
  const session = await getSession()

  if (!session) {
    throw redirect({ to: ROUTES.LOGIN })
  }

  return session
}
