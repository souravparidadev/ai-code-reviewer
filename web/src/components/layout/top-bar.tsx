'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, getPageTitle, isNavItemActive } from './nav-items'

export function TopBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-10">
        <h1 className="text-sm font-medium text-foreground">{getPageTitle(pathname)}</h1>
        <span className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Connected to GitHub
        </span>
      </div>

      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                active ? 'bg-zinc-900 text-foreground' : 'text-muted-foreground hover:bg-zinc-900/60 hover:text-foreground',
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
