import { Router, Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../lib/db";

const router = Router();

const GITHUB_CALLBACK_URL =
  "http://localhost:4000/auth/github/callback";

// ─────────────────────────────────────────────
// 1. Start GitHub OAuth
// GET /auth/github
// ─────────────────────────────────────────────
router.get("/github", (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "GITHUB_CLIENT_ID is not configured",
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "read:user user:email repo",
  });

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?${params.toString()}`;

  res.redirect(githubAuthUrl);
});

// ─────────────────────────────────────────────
// 2. GitHub OAuth Callback
// GET /auth/github/callback
// ─────────────────────────────────────────────
router.get(
  "/github/callback",
  async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        error: "No authorization code provided",
      });
    }

    try {
      // ───────────────────────────────────────
      // Step A: Exchange GitHub code for token
      // ───────────────────────────────────────
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        throw new Error("Failed to retrieve GitHub access token");
      }

      // ───────────────────────────────────────
      // Step B: Get GitHub user profile
      // ───────────────────────────────────────
      const userResponse = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      const githubUser = userResponse.data;

      // ───────────────────────────────────────
      // Step C: Save/update user in PostgreSQL
      // ───────────────────────────────────────
      const user = await prisma.user.upsert({
        where: {
          githubId: String(githubUser.id),
        },

        update: {
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
          accessToken,
        },

        create: {
          githubId: String(githubUser.id),
          username: githubUser.login,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
          accessToken,
        },
      });

      // ───────────────────────────────────────
      // Step D: Create JWT
      // ───────────────────────────────────────
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
      }

      const jwtToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        jwtSecret,
        {
          expiresIn: "7d",
        }
      );

      // ───────────────────────────────────────
      // Step E: Store JWT in HTTP-only cookie
      // ───────────────────────────────────────
      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // ───────────────────────────────────────
      // Step F: Temporary success page
      // ───────────────────────────────────────
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AI Code Reviewer - Login</title>
          </head>

          <body
            style="
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 80px;
            "
          >
            <h1>🎉 Login Successful!</h1>

            <p>
              Welcome,
              <strong>${user.username}</strong>!
            </p>

            <p>
              Your GitHub account has been connected successfully.
            </p>

            <p>
              Your secure session cookie has been created.
            </p>

            <img
              src="${user.avatarUrl}"
              width="100"
              height="100"
              style="border-radius: 50%; margin-top: 20px;"
            />

            <p style="margin-top: 30px;">
              <a href="/me">
                Test protected /me route
              </a>
            </p>
          </body>
        </html>
      `);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "GitHub OAuth error:",
          error.response?.data || error.message
        );
      } else {
        console.error("GitHub OAuth error:", error);
      }

      return res.status(500).json({
        error: "Authentication failed",
      });
    }
  }
);

export default router;