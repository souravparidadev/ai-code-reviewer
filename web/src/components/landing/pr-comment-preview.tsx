import { ScanSearch } from 'lucide-react'

const DIFF_LINES = [
  { number: 41, type: 'context', code: '  const user = await db.users.findByEmail(email)' },
  { number: 42, type: 'added', code: '  if (user.passwordHash !== hash(password)) {' },
  { number: 43, type: 'context', code: "    throw new AuthError('Invalid credentials')" },
] as const

export function PrCommentPreview() {
  return (
    <figure
      aria-label="Example AI review comment on a GitHub pull request"
      className="w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 [font-variant-ligatures:none]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2.5">
        <span className="truncate font-mono text-xs text-zinc-400">src/auth/login.ts</span>
        <span className="shrink-0 font-mono text-xs text-zinc-500">
          <span className="text-emerald-400">+1</span> <span className="text-red-400">-1</span>
        </span>
      </div>

      <pre className="overflow-x-auto border-b border-zinc-800 py-2 font-mono text-xs leading-6">
        {DIFF_LINES.map((line) => (
          <div
            key={line.number}
            className={line.type === 'added' ? 'bg-emerald-500/10 text-zinc-200' : 'text-zinc-500'}
          >
            <span className="inline-block w-10 select-none pr-3 text-right text-zinc-600">{line.number}</span>
            <span className="inline-block w-4 select-none text-zinc-600">{line.type === 'added' ? '+' : ' '}</span>
            {line.code}
          </div>
        ))}
      </pre>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-950">
            <ScanSearch className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-zinc-100">ai-code-reviewer</span>
              <span className="rounded border border-zinc-700 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                bot
              </span>
              <span className="text-xs text-zinc-500">reviewed just now</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-red-400">
                HIGH
              </span>
              <code className="font-mono text-xs text-zinc-400">src/auth/login.ts:42</code>
            </div>

            <figcaption className="mt-3 text-sm leading-relaxed text-zinc-300">
              <span className="font-medium text-zinc-100">Possible null dereference.</span>{' '}
              <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-200">findByEmail</code>{' '}
              returns <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-200">null</code>{' '}
              for unknown emails, so accessing{' '}
              <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-200">user.passwordHash</code>{' '}
              will throw a <code className="font-mono text-xs">TypeError</code> instead of returning a 401.
            </figcaption>

            <pre className="mt-3 overflow-x-auto rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 py-2 font-mono text-xs leading-5 text-zinc-300">
              {'if (!user || user.passwordHash !== hash(password)) {'}
            </pre>
          </div>
        </div>
      </div>
    </figure>
  )
}
