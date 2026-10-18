import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import { fetchUserRepositories } from "../services/github";
import { indexQueue } from "../queues/indexQueue";

const router = Router();

// GET /api/repos
// Fetch GitHub repositories and show which ones are enabled for AI review
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const githubRepos = await fetchUserRepositories(req.user.userId);

    const enabledRepos = await prisma.repository.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        githubRepoId: true,
      },
    });

    const enabledRepoIds = new Set(
      enabledRepos.map((repo) => Number(repo.githubRepoId))
    );

    const repositories = githubRepos.map((repo) => ({
      ...repo,
      isEnabled: enabledRepoIds.has(Number(repo.githubRepoId)),
    }));

    res.json({
      repositories,
    });
  } catch (error: any) {
    console.error("❌ Fetch Repos Error:", error.message);

    res.status(500).json({
      error: "Failed to fetch repositories",
    });
  }
});

// POST /api/repos/enable
// Enable a repository for AI code review
router.post("/enable", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      githubRepoId,
      fullName,
      defaultBranch,
    } = req.body;

    if (!githubRepoId || !fullName) {
      return res.status(400).json({
        error: "Missing repository details",
      });
    }

    const repository = await prisma.repository.upsert({
      where: {
        githubRepoId: Number(githubRepoId),
      },

      update: {
        enabled: true,
        fullName,
        defaultBranch: defaultBranch || "main",
      },

      create: {
        userId: req.user.userId,
        githubRepoId: Number(githubRepoId),
        fullName,
        defaultBranch: defaultBranch || "main",
        enabled: true,
      },
    });

    await indexQueue.add("index-repository", {
      repositoryId: repository.id,
    });

    res.json({
      message: "Repository enabled successfully",
      repository,
      indexing: "queued",
    });
  } catch (error: any) {
    console.error("❌ Enable Repo Error:", error.message);

    res.status(500).json({
      error: "Failed to enable repository",
    });
  }
});

// POST /api/repos/disable
// Disable a repository for AI code review
router.post("/disable", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { githubRepoId } = req.body;

    if (!githubRepoId) {
      return res.status(400).json({
        error: "Missing githubRepoId",
      });
    }

    await prisma.repository.deleteMany({
      where: {
        githubRepoId: Number(githubRepoId),
        userId: req.user.userId,
      },
    });

    res.json({
      message: "Repository disabled successfully",
    });
  } catch (error: any) {
    console.error("❌ Disable Repo Error:", error.message);

    res.status(500).json({
      error: "Failed to disable repository",
    });
  }
});

// GET /api/repos/:repositoryId/reviews
// Get recent AI reviews for a repository
router.get(
  "/:repositoryId/reviews",
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const repositoryId = Array.isArray(req.params.repositoryId)
  ? req.params.repositoryId[0]
  : req.params.repositoryId;

      const repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId,
          userId: req.user.userId,
        },
      });

      if (!repository) {
        return res.status(404).json({
          error: "Repository not found",
        });
      }

      const reviews = await prisma.reviewJob.findMany({
        where: {
          repositoryId: repository.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      res.json({
        reviews: reviews.map((review) => ({
          id: review.id,
          prNumber: review.prNumber,
          headSha: review.headSha,
          status: review.status,
          errorMessage: review.errorMessage,
          comments: review._count.comments,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        })),
      });
    } catch (error: any) {
      console.error("❌ Fetch Reviews Error:", error.message);

      res.status(500).json({
        error: "Failed to fetch reviews",
      });
    }
  }
);

export default router;