import { Router, Request, Response } from "express";
import crypto from "crypto";
import { reviewQueue } from "../queues/reviewQueue";

const router = Router();

function verifyGitHubSignature(
  req: Request,
  signature: string | undefined
): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const payload = JSON.stringify(req.body);

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

router.post("/github", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-hub-signature-256"] as
      | string
      | undefined;

    // 🔐 Verify request came from GitHub
    if (!verifyGitHubSignature(req, signature)) {
      console.warn("🚨 Invalid GitHub webhook signature");

      return res.status(401).json({
        error: "Invalid webhook signature",
      });
    }

    // GitHub tells us what type of event this is
    const event = req.headers["x-github-event"];

    console.log("📩 GitHub Webhook Event:", event);

    // For now, only process pull request events
    if (event !== "pull_request") {
      return res.status(200).json({
        message: "Event ignored",
      });
    }

    // Add the event to our Redis/BullMQ queue
    await reviewQueue.add("review-pull-request", {
      event,
      payload: req.body,
    });

    console.log("📦 Pull request added to review queue");

    return res.status(202).json({
      message: "Pull request queued for review",
    });
  } catch (error) {
    console.error("❌ Webhook Error:", error);

    return res.status(500).json({
      error: "Failed to process webhook",
    });
  }
});

export default router;