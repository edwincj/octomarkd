import type { GitHubApiResponse, GitRepo, GitUser } from "@/types";

export const getUsers = async (
  query: string
): Promise<GitHubApiResponse<GitUser>> => {
  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=${query}`
    );
    const data: GitHubApiResponse<GitUser> = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch github users");
  }
};

export const getRepos = async (
  query: string
): Promise<GitHubApiResponse<GitRepo>> => {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${query}`
    );
    const data: GitHubApiResponse<GitRepo> = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch github repositories");
  }
};

export const validateRepository = async (
  repoFullName: string
): Promise<GitRepo | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}`
    );
    if (!response.ok) {
      throw new Error(`Repository ${repoFullName} not found`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error validating repository ${repoFullName}:`, error);
    return null;
  }
};
