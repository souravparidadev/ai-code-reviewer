export type ReviewStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type IndexingStatus = 'NOT_INDEXED' | 'INDEXING' | 'INDEXED'

export interface Repo {
  id: string
  full_name: string
  private: boolean
  default_branch: string
  enabled: boolean
  indexing_status: IndexingStatus
}

export interface ReviewJob {
  id: string
  pr_number: number
  pr_title: string
  repo_full_name: string
  status: ReviewStatus
  issues_count: number
  head_sha: string
  created_at: string
}

export interface ReviewComment {
  id: string
  review_job_id: string
  severity: Severity
  file_path: string
  line: number
  body: string
}

export interface DashboardStats {
  total_reviews: number
  issues_found: number
  repos_enabled: number
  avg_review_time_seconds: number
}

export interface User {
  username: string
  avatar_url?: string
}
