import "dotenv/config";

import { Worker } from "bullmq";
import prisma from "../lib/db";

import {
  getPullRequest,
  getPullRequestFiles,
  postPullRequestComment,
} from "../services/github";

import { reviewCode } from "../services/ai";

const redisUrl =
  process.env.REDIS_URL || "redis://localhost:6379";

const redis = new URL(redisUrl);

const reviewWorker = new Worker(
  "code-review",

  async (job) => {
    console.log("🎯 Review job received!");
    console.log("Job ID:", job.id);

    const { payload } = job.data;

    // --------------------------------------------------
    // 1. Validate GitHub webhook payload
    // --------------------------------------------------

    if (!payload?.repository || !payload?.pull_request) {
      console.log(
        "⚠️ Invalid pull request payload"
      );

      return {
        success: false,
        message: "Invalid pull request payload",
      };
    }

    const githubRepoId = Number(
      payload.repository.id
    );

    const owner =
      payload.repository.owner.login;

    const repo =
      payload.repository.name;

    const pullNumber = Number(
      payload.pull_request.number
    );

    const headSha =
      payload.pull_request.head.sha;

    console.log(
      `📂 Repository: ${owner}/${repo}`
    );

    console.log(
      `🔀 Pull Request: #${pullNumber}`
    );

    console.log(
      `🧾 Commit: ${headSha}`
    );

    console.log(
      `🔎 GitHub Repository ID: ${githubRepoId}`
    );

    // --------------------------------------------------
    // 2. Find repository in our database
    // --------------------------------------------------

    const repository =
      await prisma.repository.findUnique({
        where: {
          githubRepoId,
        },
        include: {
          user: true,
        },
      });

    if (!repository) {
      console.log(
        "⚠️ Repository is not registered for AI review"
      );

      return {
        success: false,
        message: "Repository not registered",
      };
    }

    if (!repository.enabled) {
      console.log(
        "⚠️ Repository is disabled"
      );

      return {
        success: false,
        message: "Repository is disabled",
      };
    }

    console.log(
      `👤 GitHub user: ${repository.user.username}`
    );

    // --------------------------------------------------
    // 3. Prevent duplicate review jobs
    // --------------------------------------------------

    const existingJob =
      await prisma.reviewJob.findUnique({
        where: {
          repositoryId_prNumber_headSha: {
            repositoryId: repository.id,
            prNumber: pullNumber,
            headSha,
          },
        },
      });

    if (existingJob) {
      console.log(
        `⚠️ Review already exists: ${existingJob.id}`
      );

      return {
        success: true,
        message: "Review already exists",
        reviewJobId: existingJob.id,
      };
    }

    // --------------------------------------------------
    // 4. Create ReviewJob
    // --------------------------------------------------

    const reviewJob =
      await prisma.reviewJob.create({
        data: {
          repositoryId: repository.id,
          prNumber: pullNumber,
          headSha,
          status: "PROCESSING",
        },
      });

    console.log(
      `📝 ReviewJob created: ${reviewJob.id}`
    );

    try {
      // --------------------------------------------------
      // 5. Fetch pull request
      // --------------------------------------------------

      console.log(
        "📥 Fetching pull request information..."
      );

      const pullRequest =
        await getPullRequest(
          repository.user.id,
          owner,
          repo,
          pullNumber
        );

      console.log(
        `📌 PR title: ${pullRequest.title}`
      );

      // --------------------------------------------------
      // 6. Fetch changed files
      // --------------------------------------------------

      console.log(
        "📂 Fetching changed files..."
      );

      const files =
        await getPullRequestFiles(
          repository.user.id,
          owner,
          repo,
          pullNumber
        );

      console.log(
        `📄 Changed files: ${files.length}`
      );

      // --------------------------------------------------
      // 7. Review each changed file with Gemini
      // --------------------------------------------------

      let totalComments = 0;

      for (const file of files) {
        console.log("");

        console.log(
          `🔍 Reviewing: ${file.filename}`
        );

        // --------------------------------------------------
        // Skip files without a patch
        // --------------------------------------------------

        if (!file.patch) {
          console.log(
            "⏭️ No patch available, skipping file"
          );

          continue;
        }

        // --------------------------------------------------
        // Skip deleted files
        // --------------------------------------------------

        if (file.status === "removed") {
          console.log(
            "⏭️ Deleted file, skipping"
          );

          continue;
        }

        // --------------------------------------------------
        // Skip lock files
        // --------------------------------------------------

        const ignoredFiles = [
          "package-lock.json",
          "yarn.lock",
          "pnpm-lock.yaml",
          "composer.lock",
          "Gemfile.lock",
        ];

        if (
          ignoredFiles.includes(
            file.filename
          )
        ) {
          console.log(
            "⏭️ Lock file, skipping"
          );

          continue;
        }

        // --------------------------------------------------
        // Skip extremely large patches
        // --------------------------------------------------

        const maxPatchSize = 15000;

        if (
          file.patch.length > maxPatchSize
        ) {
          console.log(
            `⏭️ Patch too large (${file.patch.length} characters), skipping`
          );

          continue;
        }

        console.log(
          `📊 Patch size: ${file.patch.length} characters`
        );

        // --------------------------------------------------
        // Send file patch to Gemini
        // --------------------------------------------------

        const aiResult =
          await reviewCode(
            file.filename,
            file.patch
          );

        console.log(
          `🤖 AI found ${aiResult.comments.length} issue(s)`
        );

        // --------------------------------------------------
        // 8. Save AI comments to PostgreSQL
        // --------------------------------------------------

        for (
          const comment of aiResult.comments
        ) {
          await prisma.reviewComment.create({
            data: {
              reviewJobId:
                reviewJob.id,

              filePath:
                comment.filePath,

              lineNumber:
                comment.lineNumber,

              severity:
                comment.severity,

              body:
                comment.body,
            },
          });

          totalComments++;

          console.log(
            `💾 Saved ${comment.severity} issue in ${comment.filePath}:${comment.lineNumber}`
          );
        }
      }

      // --------------------------------------------------
      // 9. Build GitHub review summary
      // --------------------------------------------------

      console.log(
        "📝 Building GitHub review summary..."
      );

      const reviewComments =
        await prisma.reviewComment.findMany({
          where: {
            reviewJobId: reviewJob.id,
          },

          orderBy: {
            severity: "desc",
          },
        });

      let markdown =
        "## 🤖 AI Code Review\n\n";

      if (reviewComments.length === 0) {
        markdown +=
          "✅ No significant issues found in the changed code.";
      } else {
        markdown +=
          `Found **${reviewComments.length} issue(s)**.\n\n`;

        for (const comment of reviewComments) {
          markdown +=
            `### ${comment.severity}\n`;

          markdown +=
            `- \`${comment.filePath}:${comment.lineNumber}\` — ${comment.body}\n\n`;
        }
      }

      // --------------------------------------------------
      // 10. Post review summary to GitHub
      // --------------------------------------------------

      console.log(
        "💬 Posting AI review to GitHub..."
      );

      await postPullRequestComment(
        repository.user.id,
        owner,
        repo,
        pullNumber,
        markdown
      );

      console.log(
        "✅ Review summary posted to GitHub"
      );

      // --------------------------------------------------
      // 11. Mark job as completed
      // --------------------------------------------------

      await prisma.reviewJob.update({
        where: {
          id: reviewJob.id,
        },

        data: {
          status: "COMPLETED",
        },
      });

      console.log("");

      console.log(
        `🎉 Review completed: ${totalComments} issue(s) found`
      );

      return {
        success: true,

        message:
          "AI code review completed",

        reviewJobId:
          reviewJob.id,

        repository:
          repository.fullName,

        pullNumber,

        headSha,

        filesChanged:
          files.length,

        commentsCreated:
          totalComments,
      };
    } catch (error) {
      // --------------------------------------------------
      // 12. Mark job as failed
      // --------------------------------------------------

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown review error";

      console.error(
        "❌ Review processing failed:",
        errorMessage
      );

      await prisma.reviewJob.update({
        where: {
          id: reviewJob.id,
        },

        data: {
          status: "FAILED",
          errorMessage,
        },
      });

      throw error;
    }
  },

  {
    connection: {
      host: redis.hostname,
      port: Number(
        redis.port || 6379
      ),
    },
  }
);

// --------------------------------------------------
// Worker events
// --------------------------------------------------

reviewWorker.on(
  "completed",
  (job) => {
    console.log(
      `✅ Review job ${job.id} completed`
    );
  }
);

reviewWorker.on(
  "failed",
  (job, error) => {
    console.error(
      `❌ Review job ${job?.id} failed:`,
      error.message
    );
  }
);

console.log(
  "🤖 Review worker is running..."
);