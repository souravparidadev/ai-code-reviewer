"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ReviewHistoryTable } from "@/components/dashboard/review-history-table"
import { ReviewsEmptyState } from "@/components/dashboard/reviews-empty-state"
import { api } from "@/lib/api"
import type { ReviewJob } from "@/lib/types"

type DashboardResponse = {
  stats: {
    total_reviews: number
    issues_found: number
    repos_enabled: number
    avg_review_time_seconds: number
  }
  reviews: ReviewJob[]
}

export default function Page() {
  const [reviews, setReviews] = useState<ReviewJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<DashboardResponse>("/api/dashboard")
      .then((data) => {
        setReviews(data.reviews)
      })
      .catch((error) => {
        toast.error("Could not load review history", {
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Review History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every pull request reviewed by AI Code Reviewer.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading review history…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-foreground">
          Review History
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every pull request reviewed by AI Code Reviewer.
        </p>
      </div>

      {reviews.length > 0 ? (
        <ReviewHistoryTable reviews={reviews} />
      ) : (
        <ReviewsEmptyState />
      )}
    </div>
  )
}