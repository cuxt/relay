import { createServerFn } from '@tanstack/react-start'

export interface SystemInfo {
  version: string
  startTime: number
  nodeVersion: string
}

export const getSystemInfo = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SystemInfo> => {
    const startTime = Date.now() - (process.uptime() * 1000)
    return {
      version: process.env.npm_package_version || '1.0.0',
      startTime,
      nodeVersion: process.version,
    }
  }
)
