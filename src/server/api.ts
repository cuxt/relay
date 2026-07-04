import { Elysia } from 'elysia'
import { docs } from './docs'
import { authRoutes } from './routes/auth'
import { releaseRoutes } from './routes/releases'
import { emailRoutes } from './routes/email'

export const api = new Elysia().use(docs).use(authRoutes).use(releaseRoutes).use(emailRoutes)
