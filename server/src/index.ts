import "dotenv/config";

import express from "express";
import cors from "cors";
import prisma from "./lib/db";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AI Code Reviewer API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ai-code-reviewer-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-health", async (req, res) => {
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});