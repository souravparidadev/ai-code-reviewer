import { Skeleton } from '@/components/ui/skeleton'
import { formatDuration } from '@/lib/format'
import type { DashboardStats } from '@/lib/types'

const numberFormatter = new Intl.NumberFormat('en-US')

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</dd>
    </div>
  )
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Reviews" value={numberFormatter.format(stats.total_reviews)} />
      <StatCard label="Issues Found" value={numberFormatter.format(stats.issues_found)} />
      <StatCard label="Repos Enabled" value={numberFormatter.format(stats.repos_enabled)} />
      <StatCard label="Avg Review Time" value={formatDuration(stats.avg_review_time_seconds)} />
    </dl>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="mt-3 h-7 w-16 bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}
