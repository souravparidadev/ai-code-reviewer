'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'
import { Logo } from './logo'
import { NAV_ITEMS, isNavItemActive } from './nav-items'

interface AppSidebarProps {
  user: User
  signOutAction: () => Promise<void>
}

export function AppSidebar({ user, signOutAction }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-14 items-center px-5">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.href, pathname)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-zinc-900 text-foreground'
                      : 'text-muted-foreground hover:bg-zinc-900/60 hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
        <Avatar className="size-7">
          {user.avatar_url ? <AvatarImage src={user.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-zinc-800 text-xs text-foreground">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 truncate text-sm text-foreground">{user.username}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-zinc-900 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="sr-only">Log out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
