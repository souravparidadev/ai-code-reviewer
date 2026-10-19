import { FileCode2 } from 'lucide-react'
import { SeverityBadge } from '@/components/badges'
import type { ReviewComment } from '@/lib/types'

export function ReviewCommentCard({ comment }: { comment: ReviewComment }) {
  return (
    <article className="rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
        <SeverityBadge severity={comment.severity} />
        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <FileCode2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate text-foreground">{comment.file_path}</span>
          <span>:{comment.line}</span>
        </span>
      </header>
      <p className="px-4 py-4 text-sm leading-relaxed text-pretty text-zinc-300">{comment.body}</p>
    </article>
  )
}
