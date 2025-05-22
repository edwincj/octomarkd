import { render, screen } from '@testing-library/react';
import Layout from './Layout';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
  NavLink: ({ to, className, children }: any) => (
    <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className}>
      {children}
    </a>
  ),
}));
vi.mock('lucide-react', () => ({
  Bookmark: () => <span data-testid="icon-bookmark" />,
  FolderGit: () => <span data-testid="icon-foldergit" />,
  Search: () => <span data-testid="icon-search" />,
  LogOut: () => <span data-testid="icon-logout" />,
  User: () => <span data-testid="icon-user" />,
}));
vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));
const mockLogout = vi.fn();
vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { name: 'Test User' }, logout: mockLogout }),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header, nav, and outlet', () => {
    render(<Layout />);
    expect(screen.getByText('OctoMarkD')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getAllByTestId(/icon-/)).toHaveLength(5);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders correct nav links', () => {
    render(<Layout />);
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /bookmarks/i })).toHaveAttribute('href', '/bookmarks');
  });

  it('renders navigation, user name, and outlet', () => {
    render(<Layout />);
    expect(screen.getByText('OctoMarkD')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    render(<Layout />);
    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    await userEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
