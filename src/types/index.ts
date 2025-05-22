export type GitUser = {
  login: string;
  id: number;
  html_url: string;
  repos_url: string;
  avatar_url: string;
};

export interface GitRepo {
  id: number;
  name: string;
  full_name: string;
  owner: Pick<GitUser, "login" | "avatar_url" | "html_url">;
  html_url: string;
  description: string;
  updated_at: string;
  stargazers_count: number;
  language: string;
  forks_count: number;
  isBookmarked?: boolean;
}

export type GitHubApiResponse<T> = {
  incomplete_results: boolean;
  items: Array<T>;
  total_count: number;
};

export type BookMark = Pick<
  GitRepo,
  | "id"
  | "name"
  | "full_name"
  | "html_url"
  | "description"
  | "owner"
  | "forks_count"
  | "stargazers_count"
  | "language"
> & {
  bookmarked_at: string;
};

export type User = {
  email: string;
  name: string;
  password: string;
};

export type UserBookMarks = Map<string, Array<BookMark>>;
