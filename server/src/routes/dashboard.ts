import { Router, Request, Response } from "express";
import prisma from "../lib/db";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const repositories = await prisma.repository.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        fullName: true,
        enabled: true,
      },
    });

    const repositoryIds = repositories.map((repo) => repo.id);

    const [
      totalReviews,
      issuesFound,
      reviewJobs,
    ] = await Promise.all([
      prisma.reviewJob.count({
        where: {
          repositoryId: {
            in: repositoryIds,
          },
        },
      }),

      prisma.reviewComment.count({
        where: {
          reviewJob: {
            repositoryId: {
              in: repositoryIds,
            },
          },
        },
      }),

      prisma.reviewJob.findMany({
        where: {
          repositoryId: {
            in: repositoryIds,
          },
        },
        include: {
          repository: {
            select: {
              fullName: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
    ]);

    const completedJobs = reviewJobs.filter(
      (job) => job.status === "COMPLETED",
    );

    let averageReviewTimeSeconds = 0;

    if (completedJobs.length > 0) {
      const totalSeconds = completedJobs.reduce((sum, job) => {
        const duration =
          job.updatedAt.getTime() - job.createdAt.getTime();

        return sum + Math.max(0, duration / 1000);
      }, 0);

      averageReviewTimeSeconds =
        Math.round(totalSeconds / completedJobs.length);
    }

    const reviews = reviewJobs.map((job) => ({
      id: job.id,
      pr_number: job.prNumber,
      pr_title: `Pull request #${job.prNumber}`,
      repo_full_name: job.repository.fullName,
      status: job.status,
      issues_count: job._count.comments,
      head_sha: job.headSha,
      created_at: job.createdAt.toISOString(),
    }));

    return res.json({
      stats: {
        total_reviews: totalReviews,
        issues_found: issuesFound,
        repos_enabled: repositories.filter(
          (repo) => repo.enabled,
        ).length,
        avg_review_time_seconds: averageReviewTimeSeconds,
      },
      reviews,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);

    return res.status(500).json({
      error: "Failed to load dashboard data",
    });
  }
});

export default router;