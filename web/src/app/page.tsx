import type { Metadata } from 'next'
import { ArchitectureSection } from '@/components/landing/architecture-section'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingHeader } from '@/components/landing/landing-header'

export const metadata: Metadata = {
  title: { absolute: 'AI Code Reviewer — Instant AI reviews on every pull request' },
  description:
    'AI Code Reviewer automatically reviews GitHub pull requests using AI and relevant repository context, leaving line-level comments with severity.',
}

const LOGIN_HREF = 'http://localhost:4000/auth/github'
const GITHUB_HREF = 'https://github.com'

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-[#0a0a0a]">
      <LandingHeader loginHref={LOGIN_HREF} />
      <main className="flex-1">
        <HeroSection loginHref={LOGIN_HREF} />
        <HowItWorksSection />
        <ArchitectureSection />
      </main>
      <LandingFooter githubHref={GITHUB_HREF} />
    </div>
  )
}