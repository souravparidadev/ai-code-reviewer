"use client"

import { useEffect, useState, startTransition, useOptimistic } from "react"
import { Check, GitBranch, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
import { NeutralBadge } from "@/components/badges"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import type { Repo } from "@/lib/types"

type BackendRepository = {
  githubRepoId: number
  fullName: string
  private: boolean
  defaultBranch: string
  isEnabled: boolean
}

type RepositoriesResponse = {
  repositories: BackendRepository[]
}

function IndexingBadge({
  status,
}: {
  status: Repo["indexing_status"]
}) {
  if (status === "INDEXED") {
    return (
      <Badge className="rounded-md border border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-400">
        <Check aria-hidden="true" />
        Indexed
      </Badge>
    )
  }

  if (status === "INDEXING") {
    return <NeutralBadge>Indexing…</NeutralBadge>
  }

  return (
    <span className="text-sm text-muted-foreground">
      —
    </span>
  )
}

export function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)

  const [optimisticRepos, setOptimisticEnabled] = useOptimistic(
    repos,
    (state, update: { id: string; enabled: boolean }) =>
      state.map((repo) =>
        repo.id === update.id
          ? { ...repo, enabled: update.enabled }
          : repo,
      ),
  )

  useEffect(() => {
    api<RepositoriesResponse>("/api/repos")
      .then((data) => {
        const mappedRepos: Repo[] = data.repositories.map((repo) => ({
          id: String(repo.githubRepoId),
          full_name: repo.fullName,
          private: repo.private,
          default_branch: repo.defaultBranch,
          enabled: repo.isEnabled,
          indexing_status: repo.isEnabled
            ? "INDEXED"
            : "NOT_INDEXED",
        }))

        setRepos(mappedRepos)
      })
      .catch((error) => {
        toast.error("Could not load repositories", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  function handleToggle(repo: Repo, enabled: boolean) {
    startTransition(async () => {
      setOptimisticEnabled({
        id: repo.id,
        enabled,
      })

      try {
        await api(
          `/api/repos/${enabled ? "enable" : "disable"}`,
          {
            method: "POST",
            body: JSON.stringify(
              enabled
                ? {
                    githubRepoId: Number(repo.id),
                    fullName: repo.full_name,
                    defaultBranch: repo.default_branch,
                  }
                : {
                    githubRepoId: Number(repo.id),
                  },
            ),
          },
        )

        toast.success(
          enabled ? "Reviews enabled" : "Reviews disabled",
          {
            description: repo.full_name,
          },
        )

        setRepos((current) =>
          current.map((item) =>
            item.id === repo.id
              ? {
                  ...item,
                  enabled,
                  indexing_status: enabled
                    ? "INDEXING"
                    : "NOT_INDEXED",
                }
              : item,
          ),
        )
      } catch (error) {
        toast.error("Could not update repository", {
          description:
            error instanceof Error
              ? error.message
              : `${repo.full_name} was not updated.`,
        })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Repositories
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Loading your GitHub repositories...
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading repositories…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-foreground">
          Repositories
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose which repositories receive AI reviews on new pull requests.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                Repository
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                Visibility
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                Default branch
              </TableHead>

              <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                Index
              </TableHead>

              <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                Reviews
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {optimisticRepos.map((repo) => {
              const switchId = `repo-toggle-${repo.id}`

              return (
                <TableRow
                  key={repo.id}
                  className="border-border transition-colors hover:bg-zinc-800/40"
                >
                  <TableCell className="px-4 py-3">
                    <label
                      htmlFor={switchId}
                      className="font-mono text-sm text-foreground"
                    >
                      {repo.full_name}
                    </label>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <NeutralBadge>
                      {repo.private ? (
                        <Lock aria-hidden="true" />
                      ) : (
                        <Globe aria-hidden="true" />
                      )}

                      {repo.private ? "Private" : "Public"}
                    </NeutralBadge>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
                      <GitBranch
                        className="size-3.5"
                        aria-hidden="true"
                      />

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
                      onCheckedChange={(checked) =>
                        handleToggle(repo, checked)
                      }
                      className="transition-colors duration-200"
                    />
                  </TableCell>
                </TableRow>
              )
            })}

            {optimisticRepos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No GitHub repositories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}