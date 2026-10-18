import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReviewDetailPage } from '@/components/reviews/review-detail-page'
import { getReviewComments, getReviewJob } from '@/lib/data'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const review = await getReviewJob(id)
  return { title: review ? `PR #${review.pr_number}` : 'Review not found' }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const [review, comments] = await Promise.all([getReviewJob(id), getReviewComments(id)])
  if (!review) notFound()

  return <ReviewDetailPage review={review} comments={comments} />
}
