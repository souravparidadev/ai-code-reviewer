import "dotenv/config";
import OpenAI from "openai";
import { z } from "zod";

// --------------------------------------------------
// Gemini client
// --------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing from .env"
  );
}

const client = new OpenAI({
  apiKey,

  baseURL:
    process.env.AI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const model =
  process.env.AI_MODEL || "gemini-3.8-flash";

// --------------------------------------------------
// Retry configuration
// --------------------------------------------------

const MAX_RETRIES = 3;

const INITIAL_RETRY_DELAY_MS = 1000;

// --------------------------------------------------
// AI review schema
// --------------------------------------------------

const reviewCommentSchema = z.object({
  filePath: z.string(),

  lineNumber: z
    .number()
    .int()
    .positive(),

  severity: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]),

  body: z.string().min(1),
});

const reviewResultSchema = z.object({
  summary: z.string(),

  comments: z.array(
    reviewCommentSchema
  ),
});

export type ReviewResult =
  z.infer<typeof reviewResultSchema>;

// --------------------------------------------------
// Check whether an error should be retried
// --------------------------------------------------

function isRetryableError(
  error: unknown
): boolean {
  if (
    error instanceof OpenAI.APIError
  ) {
    return (
      error.status === 429 ||
      error.status === 500 ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504
    );
  }

  return false;
}

// --------------------------------------------------
// Wait before retrying
// --------------------------------------------------

function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      resolve,
      milliseconds
    );
  });
}

// --------------------------------------------------
// Review code with Gemini
// --------------------------------------------------

export async function reviewCode(
  filePath: string,
  patch: string
): Promise<ReviewResult> {
  if (!patch.trim()) {
    return {
      summary:
        "No code changes were available for review.",

      comments: [],
    };
  }

  const prompt = `
You are an expert senior software engineer performing an automated
code review on a GitHub Pull Request.

Analyze ONLY the code provided below.

Look for REAL and actionable problems such as:

- Bugs
- Incorrect logic
- Security vulnerabilities
- Authentication/authorization problems
- SQL injection
- Command injection
- Null/undefined errors
- Race conditions
- Incorrect API usage
- Performance problems
- Resource leaks
- Dangerous error handling
- Serious maintainability problems

Do NOT report:

- Formatting
- Minor naming preferences
- Personal style preferences
- Hypothetical problems without evidence

Severity levels:

LOW = minor real issue

MEDIUM = real issue that should probably be fixed

HIGH = important bug, security or reliability problem

CRITICAL = extremely serious security or reliability problem

IMPORTANT OUTPUT RULE:

Return ONLY valid JSON.

The JSON MUST have exactly this structure:

{
  "summary": "short overall review summary",
  "comments": [
    {
      "filePath": "exact file path",
      "lineNumber": 1,
      "severity": "LOW",
      "body": "clear explanation of the problem and practical fix"
    }
  ]
}

If there are no meaningful problems:

{
  "summary": "No significant issues found.",
  "comments": []
}

Do not use markdown.
Do not use code fences.
Do not add any text outside the JSON.

FILE:
${filePath}

CODE PATCH:
${patch}
`;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `🤖 Sending code to Gemini (attempt ${attempt}/${MAX_RETRIES})...`
      );

      const response =
        await client.chat.completions.create({
          model,

          temperature: 0.1,

          messages: [
            {
              role: "system",
              content:
                "You are a precise automated code review system. Return ONLY valid JSON matching the requested schema.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],

          response_format: {
            type: "json_object",
          },
        });

      const content =
        response.choices[0]?.message?.content;

      if (!content) {
        throw new Error(
          "Gemini returned an empty response"
        );
      }

      console.log(
        "🤖 Gemini raw response:"
      );

      console.log(content);

      // --------------------------------------------------
      // Parse Gemini JSON
      // --------------------------------------------------

      const parsed =
        JSON.parse(content);

      // --------------------------------------------------
      // Validate with Zod
      // --------------------------------------------------

      const validated =
        reviewResultSchema.parse(
          parsed
        );

      console.log(
        "✅ Gemini response passed validation"
      );

      return validated;
    } catch (error) {
      const retryable =
        isRetryableError(error);

      console.error(
        `❌ AI review attempt ${attempt} failed:`,
        error
      );

      // --------------------------------------------------
      // Permanent error or final attempt
      // --------------------------------------------------

      if (
        !retryable ||
        attempt === MAX_RETRIES
      ) {
        throw new Error(
          "Failed to generate AI code review"
        );
      }

      // --------------------------------------------------
      // Exponential backoff
      // --------------------------------------------------

      const delay =
        INITIAL_RETRY_DELAY_MS *
        2 ** (attempt - 1);

      console.log(
        `⏳ Retrying Gemini request in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    "Failed to generate AI code review"
  );
}