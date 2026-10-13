# AI Code Reviewer

An event-driven AI code review system that listens to GitHub pull request events, analyzes changed code with LLMs, retrieves relevant repository context using RAG, and posts automated review feedback.

## Stack

- Node.js / Express
- TypeScript
- PostgreSQL
- Redis
- Docker
- GitHub OAuth + Webhooks
- Gemini / OpenAI-compatible AI API
- Pinecone
- React dashboard

## Current Status

- GitHub OAuth authentication
- GitHub repository integration
- Pull request webhook processing
- BullMQ + Redis job queue
- AI code review with Gemini
- PostgreSQL review history
- Repository code indexing
- Gemini embeddings
- Pinecone vector database
- RAG-based repository context retrieval
- Automated GitHub PR review summary

## Test

RAG webhook authentication test