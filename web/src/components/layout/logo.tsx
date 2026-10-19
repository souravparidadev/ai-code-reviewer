import Link from 'next/link'
import { ScanSearch } from 'lucide-react'

export function Logo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
        <ScanSearch className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">AI Code Reviewer</span>
    </Link>
  )
}
