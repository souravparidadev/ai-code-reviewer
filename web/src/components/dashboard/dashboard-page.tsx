import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardStats, ReviewJob } from '@/lib/types'
import { ReviewHistoryTable, ReviewHistoryTableSkeleton } from './review-history-table'
import { ReviewsEmptyState } from './reviews-empty-state'
import { StatCards, StatCardsSkeleton } from './stat-cards'

interface DashboardPageProps {
  stats: DashboardStats
  reviews: ReviewJob[]
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 id="review-history-heading" className="text-base font-medium text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function DashboardPage({ stats, reviews }: DashboardPageProps) {
  return (
    <div className="flex flex-col gap-12">
      <StatCards stats={stats} />
      <section aria-labelledby="review-history-heading">
        <SectionHeading title="Review History" description="Recent AI reviews across your enabled repositories." />
        {reviews.length > 0 ? <ReviewHistoryTable reviews={reviews} /> : <ReviewsEmptyState />}
      </section>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-busy="true" aria-label="Loading dashboard">
      <StatCardsSkeleton />
      <section>
        <div className="mb-4">
          <Skeleton className="h-5 w-32 bg-zinc-800" />
          <Skeleton className="mt-2 h-4 w-72 bg-zinc-800" />
        </div>
        <ReviewHistoryTableSkeleton />
      </section>
    </div>
  )
}
