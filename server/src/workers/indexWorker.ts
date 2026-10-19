import "dotenv/config";

import { Worker } from "bullmq";
import prisma from "../lib/db";
import { getRepositoryTree, getRepositoryFile } from "../services/github";
import { generateEmbedding } from "../services/embeddings";
import { pineconeIndex } from "../lib/pinecone";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new URL(redisUrl);

type TreeItem = {
  path?: string;
  type?: string;
  sha?: string;
};

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".swift",
  ".kt",
  ".kts",
  ".sql",
  ".html",
  ".css",
  ".scss",
  ".json",
  ".yaml",
  ".yml",
  ".md",
]);

const EXCLUDED_DIRECTORIES = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  "coverage/",
  "vendor/",
  "target/",
  "out/",
];

const EXCLUDED_FILENAMES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

const MAX_FILE_SIZE = 100_000;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function shouldIndexFile(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();

  if (
    EXCLUDED_DIRECTORIES.some((directory) =>
      normalizedPath.includes(directory)
    )
  ) {
    return false;
  }

  const fileName = normalizedPath.split("/").pop() || "";

  if (EXCLUDED_FILENAMES.has(fileName)) {
    return false;
  }

  if (
    fileName.endsWith(".pem") ||
    fileName.endsWith(".key") ||
    fileName.endsWith(".crt") ||
    fileName.endsWith(".p12")
  ) {
    return false;
  }

  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return false;
  }

  const extension = fileName.slice(lastDot);

  return ALLOWED_EXTENSIONS.has(extension);
}

function createChunks(text: string) {
  const lines = text.split("\n");

  const chunks: {
    text: string;
    startLine: number;
    endLine: number;
  }[] = [];

  let start = 0;

  while (start < lines.length) {
    let end = start;
    let currentLength = 0;

    while (
      end < lines.length &&
      currentLength + lines[end].length + 1 <= CHUNK_SIZE
    ) {
      currentLength += lines[end].length + 1;
      end++;
    }

    if (end === start) {
      end++;
    }

    const chunkText = lines.slice(start, end).join("\n").trim();

    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        startLine: start + 1,
        endLine: end,
      });
    }

    const nextStart = end - Math.max(1, Math.floor(CHUNK_OVERLAP / 80));

    start = Math.max(start + 1, nextStart);
  }

  return chunks;
}

function getOwnerAndRepo(fullName: string) {
  const parts = fullName.split("/");

  if (parts.length !== 2) {
    throw new Error(`Invalid repository name: ${fullName}`);
  }

  return {
    owner: parts[0],
    repo: parts[1],
  };
}

async function indexRepository(repositoryId: string) {
  const repository = await prisma.repository.findUnique({
    where: {
      id: repositoryId,
    },
    include: {
      user: true,
    },
  });

  if (!repository) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  if (!repository.enabled) {
    console.log(`Repository ${repository.fullName} is disabled. Skipping.`);
    return;
  }

  const { owner, repo } = getOwnerAndRepo(repository.fullName);

  console.log(`📚 Starting indexing: ${repository.fullName}`);

  const tree = await getRepositoryTree(
    repository.user.id,
    owner,
    repo,
    repository.defaultBranch
  );

  const files = (tree as TreeItem[]).filter(
    (item) =>
      item.type === "blob" &&
      item.path &&
      shouldIndexFile(item.path)
  );

  console.log(`📁 Found ${files.length} indexable files`);

  let totalChunks = 0;

  for (const file of files) {
    if (!file.path) continue;

    try {
      const fileData: any = await getRepositoryFile(
        repository.user.id,
        owner,
        repo,
        file.path
      );

      if (
        !fileData ||
        Array.isArray(fileData) ||
        fileData.type !== "file" ||
        !fileData.content
      ) {
        continue;
      }

      const decoded = Buffer.from(
        fileData.content,
        "base64"
      ).toString("utf-8");

      if (!decoded.trim()) {
        continue;
      }

      if (Buffer.byteLength(decoded, "utf-8") > MAX_FILE_SIZE) {
        console.log(`⏭️ Skipping large file: ${file.path}`);
        continue;
      }

      const chunks = createChunks(decoded);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const embedding = await generateEmbedding(chunk.text);

        const vectorId = `${repository.id}:${file.path}:${i}`;

       await pineconeIndex.upsert({
  records: [
    {
      id: vectorId,
      values: embedding,
      metadata: {
        repoId: repository.id,
        filePath: file.path,
        text: chunk.text,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        branch: repository.defaultBranch,
      },
    },
  ],
});

        totalChunks++;

        console.log(
          `✅ Indexed ${file.path} (${i + 1}/${chunks.length})`
        );
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to index ${file.path}:`,
        error?.message || error
      );
    }
  }

  console.log(
    `🎉 Finished indexing ${repository.fullName}: ${totalChunks} chunks`
  );
}

const worker = new Worker(
  "code-indexing",
  async (job) => {
    const repositoryId = job.data.repositoryId as string;

    if (!repositoryId) {
      throw new Error("Missing repositoryId in indexing job");
    }

    await indexRepository(repositoryId);
  },
  {
    connection: {
      host: redis.hostname,
      port: Number(redis.port || 6379),
    },
    concurrency: 1,
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Indexing job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(
    `❌ Indexing job ${job?.id} failed:`,
    error.message
  );
});

console.log("🚀 Code indexing worker started");
