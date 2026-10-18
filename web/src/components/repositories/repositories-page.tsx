'use client'

import { startTransition, useOptimistic } from 'react'
import { Check, GitBranch, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { NeutralBadge } from '@/components/badges'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Repo } from '@/lib/types'

interface RepositoriesPageProps {
  repos: Repo[]
  onToggle: (repoId: string, enabled: boolean) => Promise<unknown>
}

function IndexingBadge({ status }: { status: Repo['indexing_status'] }) {
  if (status === 'INDEXED') {
    return (
      <Badge className="rounded-md border border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-400">
        <Check aria-hidden="true" />
        Indexed
      </Badge>
    )
  }
  if (status === 'INDEXING') return <NeutralBadge>Indexing…</NeutralBadge>
  return <span className="text-sm text-muted-foreground">—</span>
}

export function RepositoriesPage({ repos, onToggle }: RepositoriesPageProps) {
  const [optimisticRepos, setOptimisticEnabled] = useOptimistic(
    repos,
    (state, update: { id: string; enabled: boolean }) =>
      state.map((repo) => (repo.id === update.id ? { ...repo, enabled: update.enabled } : repo)),
  )

  function handleToggle(repo: Repo, enabled: boolean) {
    startTransition(async () => {
      setOptimisticEnabled({ id: repo.id, enabled })
      try {
        await onToggle(repo.id, enabled)
        toast.success(enabled ? 'Reviews enabled' : 'Reviews disabled', {
          description: repo.full_name,
        })
      } catch {
        toast.error('Could not update repository', {
          description: `${repo.full_name} was left ${repo.enabled ? 'enabled' : 'disabled'}.`,
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-foreground">Repositories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which repositories receive AI reviews on new pull requests.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Repository</TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Visibility</TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Default branch</TableHead>
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Index</TableHead>
              <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Reviews</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticRepos.map((repo) => {
              const switchId = `repo-toggle-${repo.id}`
              return (
                <TableRow key={repo.id} className="border-border transition-colors hover:bg-zinc-800/40">
                  <TableCell className="px-4 py-3">
                    <label htmlFor={switchId} className="font-mono text-sm text-foreground">
                      {repo.full_name}
                    </label>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <NeutralBadge>
                      {repo.private ? <Lock aria-hidden="true" /> : <Globe aria-hidden="true" />}
                      {repo.private ? 'Private' : 'Public'}
                    </NeutralBadge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
                      <GitBranch className="size-3.5" aria-hidden="true" />
                      {repo.default_branch}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <IndexingBadge status={repo.indexing_status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Switch
                      id={switchId}
                      checked={repo.enabled}
                      onCheckedChange={(checked) => handleToggle(repo, checked)}
                      className="transition-colors duration-200"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
