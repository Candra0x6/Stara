'use client '
import SimpleCentered from '@/components/blocks/heros/simple-centered'
import AccessibilityFeatures from '@/components/blocks/features/accessibility-features'
import InclusiveTestimonialsSection from '@/components/blocks/testimonials/inclusive-testimonials'  
import { SpotlightLogoCloud } from '@/components/blocks/logos-clouds/spotlight-logo-cloud'
import { FrequentlyAskedQuestionsAccordion } from '@/components/blocks/faqs/faqs-with-accordion'
import SimpleCenteredCTA from '@/components/blocks/ctas/simple-centered'
import AccessibleFooter from '@/components/blocks/footers/accessible-footer'
import SimpleThreeColumnWithLargeIcons from '@/components/blocks/features/simple-three-column-with-large-icons'
import SplitWithCodeExample from '@/components/blocks/heros/split-with-code-example'
import { ModernHeroWithGradients } from '@/components/blocks/heros/modern-hero-with-gradients'
import WithOffsetImage from '@/components/blocks/heros/with-offset-image'
import WithPhoneMockup from '@/components/blocks/heros/with-phone-mockup'
import WithImageTiles from '@/components/blocks/heros/with-image-tiles'
import { NavbarWithChildren } from '@/components/blocks/navbars/navbar-with-children'
import { useAuth } from '@/hooks/use-auth'
import { useSession } from 'next-auth/react'

export default function Home() {

  return (
    <main className="max-w- mx-auto px-4 py-6 accessibility-text click-assist" role="main" aria-label="Home page">
      <WithImageTiles />
      <AccessibilityFeatures />
      <SimpleThreeColumnWithLargeIcons />
      <InclusiveTestimonialsSection />
      <FrequentlyAskedQuestionsAccordion />
      <SimpleCenteredCTA />
    </main>
  )
}