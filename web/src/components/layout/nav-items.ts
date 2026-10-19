import { FolderGit2, History, LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { href: '/reviews', label: 'Review History', icon: History },
]

export function isNavItemActive(href: string, pathname: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function getPageTitle(pathname: string) {
  if (/^\/reviews\/[^/]+$/.test(pathname)) return 'Review Detail'
  return NAV_ITEMS.find((item) => isNavItemActive(item.href, pathname))?.label ?? 'Dashboard'
}
