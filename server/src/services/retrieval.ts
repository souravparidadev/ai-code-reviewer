import { pineconeIndex } from "../lib/pinecone";
import { generateEmbedding } from "./embeddings";

export async function retrieveRelevantCode(
  repositoryId: string,
  queryText: string,
  topK: number = 3
): Promise<string> {
  if (!queryText.trim()) {
    return "";
  }

  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const result = await pineconeIndex.query({
      vector: queryEmbedding,
      topK,
      filter: {
        repoId: {
          $eq: repositoryId,
        },
      },
      includeMetadata: true,
    });

    const matches = result.matches || [];

    if (matches.length === 0) {
      console.log("🔎 No relevant repository context found");
      return "";
    }

    console.log(
      `🔎 Retrieved ${matches.length} relevant code chunk(s)`
    );

    const context = matches
      .map((match: any, index: number) => {
        const metadata = match.metadata || {};

        return [
          `--- Relevant Code ${index + 1} ---`,
          `File: ${metadata.filePath || "unknown"}`,
          `Lines: ${metadata.startLine || "?"}-${metadata.endLine || "?"}`,
          `Similarity: ${
            typeof match.score === "number"
              ? match.score.toFixed(4)
              : "unknown"
          }`,
          "",
          metadata.text || "",
        ].join("\n");
      })
      .join("\n\n");

    return context;
  } catch (error: any) {
    console.error(
      "❌ Pinecone retrieval failed:",
      error?.message || error
    );

    // RAG failure should not completely break the code review.
    return "";
  }
}
