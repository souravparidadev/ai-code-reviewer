import { GitHubLoginButton } from './github-login-button'
import { PrCommentPreview } from './pr-comment-preview'

interface HeroSectionProps {
  loginHref: string
}

export function HeroSection({ loginHref }: HeroSectionProps) {
  return (
    <section aria-labelledby="hero-heading" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">GitHub App · Pull request reviews</p>
          <h1
            id="hero-heading"
            className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl"
          >
            Instant AI code reviews on every pull request.
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
            AI Code Reviewer installs on your GitHub repositories and reviews each pull request as it opens, using
            relevant context from your codebase to leave precise, line-level comments.
          </p>
          <GitHubLoginButton href={loginHref} className="mt-8" />
        </div>

        <PrCommentPreview />
      </div>
    </section>
  )
}
