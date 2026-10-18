import { GitHubMark } from '@/components/icons/github-mark'

interface LandingFooterProps {
  githubHref: string
}

export function LandingFooter({ githubHref }: LandingFooterProps) {
  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-medium text-zinc-200">AI Code Reviewer</span>
        <div className="flex items-center gap-6 text-zinc-500">
          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GitHubMark className="size-4" />
            GitHub
          </a>
          <span>Built by Sourav Parida</span>
        </div>
      </div>
    </footer>
  )
}
