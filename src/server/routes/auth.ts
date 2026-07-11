import { Elysia } from 'elysia'
import { auth } from '@/lib/auth/auth'

export const authRoutes = new Elysia({ name: 'auth' }).mount(auth.handler)
