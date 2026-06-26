import { redirect } from '@tanstack/react-router'
import type { auth } from './auth'
import { ROUTES } from '@/constants'
import { authClient } from '@/lib/auth/client'

export type Session = typeof auth.$Infer.Session
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
