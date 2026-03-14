import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createFileRoute } from '@tanstack/react-router'
import { icons } from 'lucide-react'
import { getSiteConfig } from '@/lib/site-config/queries'

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function generateLucideSvg(iconValue: string): string {
  const name = kebabToPascal(iconValue) as keyof typeof icons
  const Icon = icons[name]
  if (!Icon) return ''

  return renderToStaticMarkup(
    createElement(Icon, { size: 32 }),
  )
}

function generateEmojiSvg(emoji: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <text x="16" y="24" text-anchor="middle" font-size="24">${emoji}</text>
</svg>`
}

export const Route = createFileRoute('/api/favicon')({
  server: {
    handlers: {
      GET: async () => {
        const config = await getSiteConfig()

        if (config.iconType === 'url') {
          return Response.redirect(config.iconValue, 302)
        }

        const svg =
          config.iconType === 'emoji'
            ? generateEmojiSvg(config.iconValue)
            : generateLucideSvg(config.iconValue)

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
