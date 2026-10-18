import { Logo } from '@/components/layout/logo'
import { GitHubLoginButton } from './github-login-button'

interface LandingHeaderProps {
  loginHref: string
}

export function LandingHeader({ loginHref }: LandingHeaderProps) {
  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Logo href="/" />
        <GitHubLoginButton href={loginHref} size="sm" label="Login" />
      </div>
    </header>
  )
}
