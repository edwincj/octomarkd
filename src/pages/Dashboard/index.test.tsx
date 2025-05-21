import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('@/components/ui/input', () => ({ Input: (props: any) => <input {...props} /> }));
vi.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div>{props.children}</div>,
  CardContent: (props: any) => <div>{props.children}</div>,
  CardDescription: (props: any) => <div>{props.children}</div>,
  CardFooter: (props: any) => <div>{props.children}</div>,
  CardHeader: (props: any) => <div>{props.children}</div>,
  CardTitle: (props: any) => <h2>{props.children}</h2>,
}));
vi.mock('@/components/ui/tabs', () => ({
  Tabs: (props: any) => <div>{props.children}</div>,
  TabsList: (props: any) => <div>{props.children}</div>,
  TabsTrigger: (props: any) => <button {...props} />,
}));
vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="icon-loader2" />,
  Search: () => <span data-testid="icon-search" />,
  User: () => <span data-testid="icon-user" />,
}));
vi.mock('@/pages/dashboard/UserResults', () => ({ UserResults: (props: any) => <div data-testid="user-results">Results</div> }));
vi.mock('@/pages/dashboard/RepoResults', () => ({ RepoResults: (props: any) => <div data-testid="repo-results">Repo Results</div> }));

vi.mock('@/services/github', () => {
  return {
    getUsers: vi.fn(),
    getRepos: vi.fn(),
  };
});
import * as githubService from '@/services/github';

const mockedGithub = vi.mocked(githubService);

const fakeUser = {
  login: 'octocat',
  id: 1,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: '',
  gravatar_id: '',
  url: '',
  html_url: '',
  followers_url: '',
  following_url: '',
  gists_url: '',
  starred_url: '',
  subscriptions_url: '',
  organizations_url: '',
  repos_url: '',
  events_url: '',
  received_events_url: '',
  type: 'User',
  site_admin: false,
  score: 1,
  user_view_type: 'User',
};
const fakeRepo = {
  id: 1,
  node_id: 'MDEwOlJlcG9zaXRvcnkx',
  name: 'repo',
  full_name: 'octocat/repo',
  private: false,
  owner: fakeUser,
  html_url: '',
  description: '',
  fork: false,
  url: '',
  forks_url: '',
  keys_url: '',
  collaborators_url: '',
  teams_url: '',
  hooks_url: '',
  issue_events_url: '',
  events_url: '',
  assignees_url: '',
  branches_url: '',
  tags_url: '',
  blobs_url: '',
  git_tags_url: '',
  git_refs_url: '',
  trees_url: '',
  statuses_url: '',
  languages_url: '',
  stargazers_url: '',
  contributors_url: '',
  subscribers_url: '',
  subscription_url: '',
  commits_url: '',
  git_commits_url: '',
  comments_url: '',
  issue_comment_url: '',
  contents_url: '',
  compare_url: '',
  merges_url: '',
  archive_url: '',
  downloads_url: '',
  issues_url: '',
  pulls_url: '',
  milestones_url: '',
  notifications_url: '',
  labels_url: '',
  releases_url: '',
  deployments_url: '',
  created_at: '',
  updated_at: '',
  pushed_at: '',
  git_url: '',
  ssh_url: '',
  clone_url: '',
  svn_url: '',
  homepage: null, // must be null or undefined
  size: 0,
  stargazers_count: 0,
  watchers_count: 0,
  language: '',
  has_issues: false,
  has_projects: false,
  has_downloads: false,
  has_wiki: false,
  has_pages: false,
  has_discussions: false,
  forks_count: 0,
  mirror_url: null,
  archived: false,
  disabled: false,
  open_issues_count: 0,
  license: null,
  allow_forking: false,
  is_template: false,
  web_commit_signoff_required: false,
  topics: [],
  visibility: 'public',
  forks: 0,
  open_issues: 0,
  watchers: 0,
  default_branch: '',
  score: 1,
};
const fakeUserResponse = {
  items: [fakeUser],
  total_count: 1,
  incomplete_results: false,
};
const fakeRepoResponse = {
  items: [fakeRepo],
  total_count: 1,
  incomplete_results: false,
};
const emptyRepoResponse = {
  items: [],
  total_count: 0,
  incomplete_results: false,
};

describe('Dashboard', () => {
  beforeEach(() => {
    mockedGithub.getUsers.mockReset();
    mockedGithub.getRepos.mockReset();
  });

  it('renders search form and headings', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /search github/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /search/i }).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/search github/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  // it('shows user results after searching users', async () => {
  //   mockedGithub.getUsers.mockResolvedValueOnce(fakeUserResponse);
  //   render(<Dashboard />);
  //   fireEvent.change(screen.getByPlaceholderText(/search github/i), { target: { value: 'octocat' } });
  //   const userButton = screen.getByRole('button', { name: /users/i });
  //   fireEvent.click(userButton);
  //   fireEvent.click(screen.getByRole('button', { name: /search/i }));
  //   //expect(await screen.findByText(/results/i)).toBeInTheDocument();
  //   expect(screen.getByTestId('user-results')).toBeInTheDocument();
  // });

  it('shows repo results after searching repositories', async () => {
    mockedGithub.getRepos.mockResolvedValueOnce(fakeRepoResponse);
    render(<Dashboard />);
    fireEvent.change(screen.getByPlaceholderText(/search github/i), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: /repositories/i }));
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await screen.findByText(/repo results/i);
  });

  it('shows loading spinner when searching', async () => {
    let resolvePromise: (value: typeof fakeRepoResponse) => void = () => {};
    mockedGithub.getRepos.mockImplementation(() => new Promise((resolve) => { resolvePromise = resolve; }));
    render(<Dashboard />);
    fireEvent.change(screen.getByPlaceholderText(/search github/i), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(screen.getAllByTestId('icon-loader2').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
    resolvePromise(emptyRepoResponse);
    await waitFor(() => {
      expect(screen.queryAllByTestId('icon-loader2').length).toBe(0);
    });
  });

  it('shows empty state when no results', async () => {
    mockedGithub.getRepos.mockResolvedValueOnce(emptyRepoResponse);
    render(<Dashboard />);
    fireEvent.change(screen.getByPlaceholderText(/search github/i), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await screen.findByText(/No results found/i);
  });
});
