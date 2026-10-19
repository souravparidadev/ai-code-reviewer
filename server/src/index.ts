import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import prisma from "./lib/db";
import authRoutes from "./routes/auth";
import repoRoutes from "./routes/repos";
import dashboardRoutes from "./routes/dashboard";
import webhookRoutes from "./routes/webhook";
import { protectRoute } from "./middleware/auth";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    message: "AI Code Reviewer API is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-code-reviewer-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-health", async (_req, res) => {
  try {
    await prisma.$connect();

    res.json({
      status: "ok",
      database: "connected",
      message: "Successfully connected to PostgreSQL",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Failed to connect to PostgreSQL",
    });
  }
});

// GitHub OAuth routes
app.use("/auth", authRoutes);

// GitHub webhook routes
app.use("/webhooks", webhookRoutes);

// Protected authentication test route
app.get("/me", protectRoute, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

// Protected repository routes
app.use("/api/repos", protectRoute, repoRoutes);

// Protected dashboard routes
app.use("/api/dashboard", protectRoute, dashboardRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});