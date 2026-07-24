import { Elysia } from 'elysia'
import { docs } from './docs'
import { authRoutes } from './routes/auth'
import { releaseRoutes } from './routes/releases'
import { emailRoutes } from './routes/email'
import { storageRoutes } from './routes/storage'
import { statsRoutes } from './routes/stats'
import { channelRoutes } from './routes/channels'
import { endpointRoutes } from './routes/endpoints'
import { logRoutes } from './routes/logs'
import { aiPresetRoutes } from './routes/ai-presets'
import { aiProviderRoutes } from './routes/ai-providers'
import { telegramRoutes } from './routes/telegram'
import { pushRoutes } from './routes/push'

export const api = new Elysia()
  .use(docs)
  .use(authRoutes)
  .use(releaseRoutes)
  .use(emailRoutes)
  .use(storageRoutes)
  .use(statsRoutes)
  .use(channelRoutes)
  .use(endpointRoutes)
  .use(logRoutes)
  .use(aiPresetRoutes)
  .use(aiProviderRoutes)
  .use(telegramRoutes)
  .use(pushRoutes)
