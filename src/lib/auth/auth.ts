import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [tanstackStartCookies()]
})
