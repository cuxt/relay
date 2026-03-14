import { flushSync } from 'react-dom'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import type { MouseEvent } from 'react'

const modes = ['light', 'system', 'dark'] as const

const icons = {
  light: Sun,
  system: Monitor,
  dark: Moon
}

export function ThemeToggle() {
  const { mode, resolvedMode, setMode } = useTheme()

  const next = (e: MouseEvent<HTMLButtonElement>) => {
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length]

    // Compute the resolved mode after switching
    const nextResolved =
      nextMode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : nextMode

    // Skip view transition if resolved mode won't change
    if (!document.startViewTransition || nextResolved === resolvedMode) {
      setMode(nextMode)
      return
    }

    const x = e.clientX
    const y = e.clientY
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // light→dark: shrink old view; dark→light: expand new view
    const isDarkening = resolvedMode === 'light'

    if (isDarkening) {
      document.documentElement.dataset.themeTransition = 'shrink'
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => setMode(nextMode))
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: isDarkening
            ? [
                `circle(${maxR}px at ${x}px ${y}px)`,
                `circle(0px at ${x}px ${y}px)`
              ]
            : [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxR}px at ${x}px ${y}px)`
              ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          fill: 'forwards',
          pseudoElement: isDarkening
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)'
        }
      )
    })

    transition.finished.then(() => {
      delete document.documentElement.dataset.themeTransition
    })
  }

  const Icon = icons[mode]

  return (
    <Button variant="ghost" size="icon" onClick={next} aria-label="切换主题">
      <Icon className="h-5 w-5" />
    </Button>
  )
}
