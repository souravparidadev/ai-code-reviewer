import prisma from "../lib/db";

export async function getOctokitForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accessToken: true },
  });

  if (!user || !user.accessToken) {
    throw new Error("User not found or missing GitHub access token");
  }

  const { Octokit } = await import("@octokit/rest");

  return new Octokit({
    auth: user.accessToken,
  });
}

export async function fetchUserRepositories(userId: string) {
  const octokit = await getOctokitForUser(userId);

  const response = await octokit.request("GET /user/repos", {
    per_page: 100,
    sort: "updated",
    affiliation: "owner,collaborator,organization_member",
  });

  return response.data.map((repo) => ({
    githubRepoId: Number(repo.id),
    fullName: repo.full_name,
    defaultBranch: repo.default_branch,
    private: repo.private,
    updatedAt: repo.updated_at,
  }));
}