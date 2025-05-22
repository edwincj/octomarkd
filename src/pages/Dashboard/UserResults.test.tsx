import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserResults } from './UserResults';
import '@testing-library/jest-dom';

// Mocks
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
vi.mock('./UserRepoModal', () => ({
  UserRepositoriesModal: ({ isOpen, username }: any) => isOpen ? <div data-testid="modal">Modal for {username}</div> : null,
}));

const baseUser = {
  id: 1,
  login: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  html_url: 'https://github.com/octocat',
  repos_url: 'https://github.com/octocat/repos',
};

describe('<UserResults />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user cards with correct info', () => {
    render(<UserResults users={[baseUser]} />);
    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view profile/i })).toHaveAttribute('href', baseUser.html_url);
    expect(screen.getByRole('button', { name: /view repositories/i })).toBeInTheDocument();
  });

  it('opens modal with username when view repositories is clicked', async () => {
    render(<UserResults users={[baseUser]} />);
    const btn = screen.getByRole('button', { name: /view repositories/i });
    await userEvent.click(btn);
    expect(screen.getByTestId('modal')).toHaveTextContent('Modal for octocat');
  });
});
