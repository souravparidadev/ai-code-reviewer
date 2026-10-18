import Link from 'next/link'
import { GitHubMark } from '@/components/icons/github-mark'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GitHubLoginButtonProps {
  href: string
  label?: string
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function GitHubLoginButton({
  href,
  label = 'Login with GitHub',
  size = 'lg',
  className,
}: GitHubLoginButtonProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ size }), 'gap-2 rounded-md', size === 'lg' && 'h-10 px-4', className)}
    >
      <GitHubMark className="size-4" />
      {label}
    </Link>
  )
}
