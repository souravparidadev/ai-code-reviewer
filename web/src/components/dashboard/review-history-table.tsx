"use client"
import Link from 'next/link'
import { StatusBadge } from '@/components/badges'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/format'
import type { ReviewJob } from '@/lib/types'

const COLUMNS = ['PR', 'Repository', 'Status', 'Issues', 'Created'] as const

function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {COLUMNS.map((column) => (
              <TableHead
                key={column}
                className={`h-10 px-4 text-xs font-medium text-muted-foreground ${column === 'Issues' || column === 'Created' ? 'text-right' : ''}`}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

export function ReviewHistoryTable({ reviews }: { reviews: ReviewJob[] }) {
  const now = new Date()

  return (
    <TableFrame>
      {reviews.map((review) => (
        <TableRow key={review.id} className="relative border-border transition-colors hover:bg-zinc-800/40">
          <TableCell className="px-4 py-3">
            <Link
              href={`/reviews/${review.id}`}
              className="font-mono text-sm text-foreground outline-none after:absolute after:inset-0 focus-visible:underline"
            >
              #{review.pr_number}
              <span className="sr-only">: {review.pr_title}</span>
            </Link>
          </TableCell>
          <TableCell className="px-4 py-3 text-muted-foreground">{review.repo_full_name}</TableCell>
          <TableCell className="px-4 py-3">
            <StatusBadge status={review.status} />
          </TableCell>
          <TableCell className="px-4 py-3 text-right tabular-nums text-foreground">
            {review.status === 'COMPLETED' ? review.issues_count : <span className="text-muted-foreground">—</span>}
          </TableCell>
          <TableCell className="px-4 py-3 text-right text-muted-foreground">
            <time dateTime={review.created_at}>{formatRelativeTime(review.created_at, now)}</time>
          </TableCell>
        </TableRow>
      ))}
    </TableFrame>
  )
}

export function ReviewHistoryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <TableFrame>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i} className="border-border hover:bg-transparent">
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-12 bg-zinc-800" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-4 w-36 bg-zinc-800" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="h-5 w-20 bg-zinc-800" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="ml-auto h-4 w-6 bg-zinc-800" />
          </TableCell>
          <TableCell className="px-4 py-3.5">
            <Skeleton className="ml-auto h-4 w-20 bg-zinc-800" />
          </TableCell>
        </TableRow>
      ))}
    </TableFrame>
  )
}
