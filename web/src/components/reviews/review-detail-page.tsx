import Link from 'next/link'
import { ArrowLeft, GitCommitHorizontal } from 'lucide-react'
import { StatusBadge } from '@/components/badges'
import { formatRelativeTime, shortSha } from '@/lib/format'
import type { ReviewComment, ReviewJob, Severity } from '@/lib/types'
import { ReviewCommentCard } from './review-comment-card'

interface ReviewDetailPageProps {
  review: ReviewJob
  comments: ReviewComment[]
}

const SEVERITY_ORDER: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export function ReviewDetailPage({ review, comments }: ReviewDetailPageProps) {
  const sortedComments = [...comments].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/reviews"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Review History
      </Link>

      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-xl font-semibold text-foreground">#{review.pr_number}</h2>
          <StatusBadge status={review.status} />
        </div>
        <p className="text-base text-foreground">{review.pr_title}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{review.repo_full_name}</span>
          <span className="inline-flex items-center gap-1.5 font-mono" title={review.head_sha}>
            <GitCommitHorizontal className="size-4" aria-hidden="true" />
            {shortSha(review.head_sha)}
          </span>
          <time dateTime={review.created_at}>{formatRelativeTime(review.created_at)}</time>
        </div>
      </header>

      <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
        <h3 id="comments-heading" className="text-sm font-medium text-foreground">
          AI Comments <span className="text-muted-foreground tabular-nums">{comments.length}</span>
        </h3>
        {sortedComments.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {sortedComments.map((comment) => (
              <li key={comment.id}>
                <ReviewCommentCard comment={comment} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            {review.status === 'COMPLETED'
              ? 'No issues found in this pull request.'
              : review.status === 'FAILED'
                ? 'This review failed before any comments were produced.'
                : 'Comments will appear here once the review finishes.'}
          </p>
        )}
      </section>
    </div>
  )
}
