import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReviewStatus, Severity } from '@/lib/types'

const STATUS_STYLES: Record<ReviewStatus, { label: string; className: string; dot: string }> = {
  QUEUED: { label: 'Queued', className: 'border-amber-500/20 bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
  PROCESSING: { label: 'Processing', className: 'border-blue-500/20 bg-blue-500/10 text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  COMPLETED: { label: 'Completed', className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  FAILED: { label: 'Failed', className: 'border-red-500/20 bg-red-500/10 text-red-400', dot: 'bg-red-400' },
}

const SEVERITY_STYLES: Record<Severity, string> = {
  LOW: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  MEDIUM: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  HIGH: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  CRITICAL: 'border-red-500/20 bg-red-500/10 text-red-400',
}

const BASE = 'rounded-md border font-medium'

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const style = STATUS_STYLES[status]
  return (
    <Badge className={cn(BASE, style.className)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </Badge>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge className={cn(BASE, 'tracking-wide', SEVERITY_STYLES[severity])}>{severity}</Badge>
}

export function NeutralBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Badge className={cn(BASE, 'border-border bg-transparent text-muted-foreground', className)}>{children}</Badge>
}
