import prisma from "../lib/db";

export async function getOctokitForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true },
  });

  if (!user || !user.accessToken) {
    throw new Error(
      "User not found or missing GitHub access token"
    );
  }

  const { Octokit } = await import("@octokit/rest");

  return new Octokit({
    auth: user.accessToken,
  });
}

export async function fetchUserRepositories(
  userId: string
) {
  const octokit = await getOctokitForUser(userId);

  const response = await octokit.request(
    "GET /user/repos",
    {
      per_page: 100,
      sort: "updated",
      affiliation:
        "owner,collaborator,organization_member",
    }
  );

  return response.data.map((repo) => ({
    githubRepoId: Number(repo.id),
    fullName: repo.full_name,
    defaultBranch: repo.default_branch,
    private: repo.private,
    updatedAt: repo.updated_at,
  }));
}

export async function getPullRequest(
  userId: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = await getOctokitForUser(userId);

  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number: pullNumber,
    }
  );

  return response.data;
}

export async function getPullRequestFiles(
  userId: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const octokit = await getOctokitForUser(userId);

  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    }
  );

  return response.data;
}

export async function postPullRequestComment(
  userId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
) {
  const octokit = await getOctokitForUser(userId);

  const response = await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner,
      repo,
      issue_number: pullNumber,
      body,
    }
  );

  return response.data;
}