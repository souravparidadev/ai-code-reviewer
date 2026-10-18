import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { getDashboardStats, getReviewJobs } from '@/lib/data'

export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const [{ state }, stats, reviews] = await Promise.all([searchParams, getDashboardStats(), getReviewJobs()])

  // `?state=empty` previews the empty-state variant.
  return <DashboardPage stats={stats} reviews={state === 'empty' ? [] : reviews} />
}
