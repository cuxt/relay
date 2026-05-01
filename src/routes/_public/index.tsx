import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}