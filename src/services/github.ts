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

export const getUserRepos = async (
  user: string
): Promise<GitHubApiResponse<GitRepo>> => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${user}/repos?sort=updated`
    );
    const data: GitHubApiResponse<GitRepo> = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch github repositories of user");
  }
};
