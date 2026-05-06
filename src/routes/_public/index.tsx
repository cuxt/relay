import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div>
      <Hero />
      <Features />
    </div>
  )
}