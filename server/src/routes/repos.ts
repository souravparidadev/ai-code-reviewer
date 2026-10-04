import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import { fetchUserRepositories } from "../services/github";

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

    // 1. Fetch repositories from GitHub
    const githubRepos = await fetchUserRepositories(req.user.userId);

    // 2. Fetch repositories already enabled in our database
    const enabledRepos = await prisma.repository.findMany({
      where: {
        userId: req.user.userId,
      },
      select: {
        githubRepoId: true,
      },
    });

    // Prisma may return githubRepoId as bigint.
    // Convert everything to Number so it matches GitHub's repo ID.
    const enabledRepoIds = new Set(
      enabledRepos.map((repo) => Number(repo.githubRepoId))
    );

    // 3. Combine GitHub repository data
    // with our application's enabled status
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

    // Validate required fields
    if (!githubRepoId || !fullName) {
      return res.status(400).json({
        error: "Missing repository details",
      });
    }

    // Upsert means:
    // - Create repository if it doesn't exist
    // - Update it if it already exists
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

    res.json({
      message: "Repository enabled successfully",
      repository,
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

    // Validate repository ID
    if (!githubRepoId) {
      return res.status(400).json({
        error: "Missing githubRepoId",
      });
    }

    // Delete only the repository belonging to the logged-in user.
    // This is important for security.
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

export default router;