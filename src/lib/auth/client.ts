import { createAuthClient } from 'better-auth/react'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from './auth'
import { authAccessControl, authRoles } from './access'

export const authClient = createAuthClient({
  plugins: [
    adminClient({ ac: authAccessControl, roles: authRoles }),
    inferAdditionalFields<typeof auth>(),
  ],
})
