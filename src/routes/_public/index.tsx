import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { PushExample } from '@/components/landing/push-example'

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div>
      <Hero />
      <Features />
      <PushExample />
    </div>
  )
}
