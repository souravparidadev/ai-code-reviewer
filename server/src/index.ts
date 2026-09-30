import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});