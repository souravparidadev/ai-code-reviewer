import type { Metadata } from 'next'
import { ReviewHistoryTable } from '@/components/dashboard/review-history-table'
import { ReviewsEmptyState } from '@/components/dashboard/reviews-empty-state'
import { getReviewJobs } from '@/lib/data'

export const metadata: Metadata = { title: 'Review History' }

export default async function Page() {
  const reviews = await getReviewJobs()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-foreground">Review History</h2>
        <p className="mt-1 text-sm text-muted-foreground">Every pull request reviewed by AI Code Reviewer.</p>
      </div>
      {reviews.length > 0 ? <ReviewHistoryTable reviews={reviews} /> : <ReviewsEmptyState />}
    </div>
  )
}
