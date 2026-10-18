import Link from 'next/link'
import { GitPullRequest } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function ReviewsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        <GitPullRequest className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-medium text-foreground">No reviews yet</h3>
      <p className="mt-1 max-w-sm text-sm text-pretty text-muted-foreground">
        Enable a repository to get your first AI review.
      </p>
      <Link href="/repositories" className={buttonVariants({ className: 'mt-6' })}>
        Enable a repository
      </Link>
    </div>
  )
}
