import "server-only"

import type {
  DashboardStats,
  Repo,
  ReviewComment,
  ReviewJob,
  User,
} from "./types"

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

const repos: Repo[] = [
  {
    id: "r1",
    full_name: "acme/web-platform",
    private: true,
    default_branch: "main",
    enabled: true,
    indexing_status: "INDEXED",
  },
  {
    id: "r2",
    full_name: "acme/payments-api",
    private: true,
    default_branch: "main",
    enabled: true,
    indexing_status: "INDEXED",
  },
  {
    id: "r3",
    full_name: "acme/design-tokens",
    private: false,
    default_branch: "main",
    enabled: true,
    indexing_status: "INDEXING",
  },
  {
    id: "r4",
    full_name: "acme/infra-terraform",
    private: true,
    default_branch: "production",
    enabled: false,
    indexing_status: "NOT_INDEXED",
  },
  {
    id: "r5",
    full_name: "acme/cli",
    private: false,
    default_branch: "develop",
    enabled: false,
    indexing_status: "NOT_INDEXED",
  },
  {
    id: "r6",
    full_name: "acme/mobile-app",
    private: true,
    default_branch: "main",
    enabled: true,
    indexing_status: "INDEXED",
  },
]

const reviewJobs: ReviewJob[] = [
  {
    id: "j1",
    pr_number: 1284,
    pr_title: "Add idempotency keys to charge endpoint",
    repo_full_name: "acme/payments-api",
    status: "PROCESSING",
    issues_count: 0,
    head_sha: "a3f9c2e81b7d4f0e9a6c5b2d1e8f7a6b5c4d3e2f",
    created_at: minutesAgo(2),
  },
  {
    id: "j2",
    pr_number: 3412,
    pr_title: "Migrate settings page to server actions",
    repo_full_name: "acme/web-platform",
    status: "COMPLETED",
    issues_count: 4,
    head_sha: "9e1b7c3d5f2a8e6b4c0d9f1a3e5b7c9d2f4a6e8b",
    created_at: minutesAgo(18),
  },
  {
    id: "j3",
    pr_number: 3410,
    pr_title: "Fix race condition in session refresh",
    repo_full_name: "acme/web-platform",
    status: "COMPLETED",
    issues_count: 1,
    head_sha: "4c8e2a6f0b3d7e1c5a9f3b7d1e5c9a3f7b1d5e9c",
    created_at: minutesAgo(64),
  },
  {
    id: "j4",
    pr_number: 88,
    pr_title: "Add spacing scale tokens",
    repo_full_name: "acme/design-tokens",
    status: "QUEUED",
    issues_count: 0,
    head_sha: "f2d4b6a8c0e2f4a6b8d0c2e4f6a8b0d2c4e6f8a0",
    created_at: minutesAgo(1),
  },
  {
    id: "j5",
    pr_number: 1279,
    pr_title: "Refactor webhook signature verification",
    repo_full_name: "acme/payments-api",
    status: "FAILED",
    issues_count: 0,
    head_sha: "7b3d9f5a1c7e3b9d5f1a7c3e9b5d1f7a3c9e5b1d",
    created_at: minutesAgo(190),
  },
  {
    id: "j6",
    pr_number: 502,
    pr_title: "Offline queue for push notifications",
    repo_full_name: "acme/mobile-app",
    status: "COMPLETED",
    issues_count: 7,
    head_sha: "c1e3a5b7d9f1c3e5a7b9d1f3c5e7a9b1d3f5c7e9",
    created_at: minutesAgo(60 * 26),
  },
]

const reviewComments: ReviewComment[] = [
  {
    id: "c1",
    review_job_id: "j2",
    severity: "CRITICAL",
    file_path: "app/settings/actions.ts",
    line: 42,
    body: "The `updateBilling` action trusts `userId` from the form payload. Derive the user from the server session instead, otherwise any authenticated user can modify another account.",
  },
  {
    id: "c2",
    review_job_id: "j2",
    severity: "HIGH",
    file_path: "app/settings/actions.ts",
    line: 67,
    body: "Input is written to the database without validation. Parse the form data with the existing `settingsSchema` before persisting.",
  },
  {
    id: "c3",
    review_job_id: "j2",
    severity: "MEDIUM",
    file_path: "app/settings/page.tsx",
    line: 18,
    body: "This component fetches the user twice (here and in the layout). Consider passing the session down or using `React.cache` to dedupe the call.",
  },
  {
    id: "c4",
    review_job_id: "j2",
    severity: "LOW",
    file_path: "components/settings/form.tsx",
    line: 103,
    body: "The submit button has no pending state. Use `useFormStatus` to disable it while the action is in flight.",
  },
  {
    id: "c5",
    review_job_id: "j3",
    severity: "HIGH",
    file_path: "lib/auth/session.ts",
    line: 129,
    body: "Two concurrent refreshes can still both read the stale token before the lock is acquired. Move the read inside the critical section.",
  },
  {
    id: "c6",
    review_job_id: "j6",
    severity: "CRITICAL",
    file_path: "src/notifications/queue.ts",
    line: 21,
    body: "The queue is persisted in plain AsyncStorage including auth headers. Store tokens in the secure keychain and only enqueue payload references.",
  },
  {
    id: "c7",
    review_job_id: "j6",
    severity: "MEDIUM",
    file_path: "src/notifications/queue.ts",
    line: 88,
    body: "Retries use a fixed 1s delay. Add exponential backoff with jitter to avoid thundering-herd reconnects.",
  },
]

export async function getCurrentUser(): Promise<User> {
  return {
    username: "GitHub User",
  }
}

export async function getRepositories(): Promise<Repo[]> {
  return repos.map((repo) => ({ ...repo }))
}

export async function setRepositoryEnabled(
  repoId: string,
  enabled: boolean,
): Promise<Repo> {
  const repo = repos.find((r) => r.id === repoId)

  if (!repo) {
    throw new Error("Repository not found")
  }

  repo.enabled = enabled

  return { ...repo }
}

export async function getReviewJobs(): Promise<ReviewJob[]> {
  return [...reviewJobs].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
}

export async function getReviewJob(
  id: string,
): Promise<ReviewJob | undefined> {
  return reviewJobs.find((job) => job.id === id)
}

export async function getReviewComments(
  reviewJobId: string,
): Promise<ReviewComment[]> {
  return reviewComments.filter(
    (comment) => comment.review_job_id === reviewJobId,
  )
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    total_reviews: 1248,
    issues_found: 3967,
    repos_enabled: repos.filter((repo) => repo.enabled).length,
    avg_review_time_seconds: 102,
  }
}