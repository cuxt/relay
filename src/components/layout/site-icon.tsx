import { cn } from '@/lib/utils'

export function SiteIcon({ className }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt="Site icon"
      className={cn('w-full h-full object-contain', className)}
    />
  )
}
