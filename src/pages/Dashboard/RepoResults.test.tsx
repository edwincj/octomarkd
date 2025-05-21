import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepoResults } from './RepoResults';
import '@testing-library/jest-dom';

const addBookMarkMock = vi.fn();
const isBookmarkedMock = vi.fn();
vi.mock('@/context/BookMarkProvider', () => ({
  useBookMarks: () => ({ addBookMark: addBookMarkMock, isBookmarked: isBookmarkedMock }),
}));
vi.mock('react-router', () => ({
  NavLink: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));
vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));
vi.mock('@/components/ui/card', () => ({
  Card: (props: any) => <div>{props.children}</div>,
  CardHeader: (props: any) => <div>{props.children}</div>,
  CardContent: (props: any) => <div>{props.children}</div>,
  CardFooter: (props: any) => <div>{props.children}</div>,
  CardTitle: (props: any) => <div>{props.children}</div>,
  CardDescription: (props: any) => <div>{props.children}</div>,
}));
vi.mock('@/components/ui/avatar', () => ({
  Avatar: (props: any) => <div>{props.children}</div>,
  AvatarImage: (props: any) => <img {...props} />,
  AvatarFallback: (props: any) => <div>{props.children}</div>,
}));
vi.mock('@/components/ui/badge', () => ({ Badge: (props: any) => <span>{props.children}</span> }));
vi.mock('lucide-react', () => ({
  Bookmark: () => <span data-testid="icon-bookmark" />,
  GitFork: () => <span data-testid="icon-gitfork" />,
  Loader2: () => <span data-testid="icon-loader2" />,
  Star: () => <span data-testid="icon-star" />,
}));

const baseRepo = {
  id: 1,
  name: 'repo1',
  full_name: 'testuser/repo1',
  description: 'desc',
  html_url: 'https://github.com/testuser/repo1',
  owner: { login: 'testuser', avatar_url: '', html_url: 'https://github.com/testuser' },
  stargazers_count: 5,
  forks_count: 2,
  language: 'TypeScript',
  node_id: '',
  private: false,
  fork: false,
  url: '',
};

describe('<RepoResults />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isBookmarkedMock.mockReturnValue(false);
    addBookMarkMock.mockResolvedValue(undefined);
  });

  it('renders repository cards with correct info', () => {
    render(<RepoResults repositories={[baseRepo]} />);
    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view repository/i })).toHaveAttribute('href', baseRepo.html_url);
    expect(screen.getByRole('link', { name: /testuser/i })).toHaveAttribute('href', baseRepo.owner.html_url);
    expect(screen.getByText('Bookmark')).toBeInTheDocument();
  });

  it('calls addBookMark when bookmark button is clicked', async () => {
    render(<RepoResults repositories={[baseRepo]} />);
    const bookmarkBtn = screen.getByRole('button', { name: /bookmark/i });
    await userEvent.click(bookmarkBtn);
    await waitFor(() => expect(addBookMarkMock).toHaveBeenCalledWith(baseRepo));
  });

  it('shows Bookmarked and disables button if already bookmarked', () => {
    isBookmarkedMock.mockReturnValue(true);
    render(<RepoResults repositories={[baseRepo]} />);
    const bookmarkBtn = screen.getByRole('button', { name: /bookmarked/i });
    expect(bookmarkBtn).toBeDisabled();
  });

  it('shows loader when bookmarking', async () => {
    let resolvePromise: () => void;
    addBookMarkMock.mockImplementation(() => new Promise(res => { resolvePromise = res; }));
    render(<RepoResults repositories={[baseRepo]} />);
    const bookmarkBtn = screen.getByRole('button', { name: /bookmark/i });
    await userEvent.click(bookmarkBtn);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
    resolvePromise!();
  });
});
