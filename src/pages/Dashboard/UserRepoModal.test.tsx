import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserRepositoriesModal } from './UserRepoModal';
import { getUserRepos } from '@/services/github';
import { useBookMarks } from '@/context/BookMarkProvider';
import '@testing-library/jest-dom';

vi.mock('@/services/github', () => ({
  getUserRepos: vi.fn(),
}));

vi.mock('@/context/BookMarkProvider', () => ({
  useBookMarks: vi.fn(),
}));

vi.mock('react-router', () => ({
  NavLink: vi.fn(({ children, to, ...props }) => (
    <a href={to} {...props}>{children}</a>
  )),
}));

const mockRepos = [
  {
    id: 1,
    name: 'test-repo-1',
    description: 'Test description 1',
    language: 'JavaScript',
    stargazers_count: 10,
    forks_count: 5,
    updated_at: '2023-06-15T10:00:00Z',
    html_url: 'https://github.com/testuser/test-repo-1',
    owner: {
      avatar_url: 'https://github.com/testuser.png',
    },
  },
  {
    id: 2,
    name: 'test-repo-2',
    description: 'Test description 2',
    language: 'TypeScript',
    stargazers_count: 20,
    forks_count: 8,
    updated_at: '2023-07-20T14:30:00Z',
    html_url: 'https://github.com/testuser/test-repo-2',
    owner: {
      avatar_url: 'https://github.com/testuser.png',
    },
  },
];

describe('UserRepositoriesModal', () => {
  const mockOnClose = vi.fn();
  const mockAddBookMark = vi.fn();
  const mockIsBookmarked = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    (getUserRepos as any).mockResolvedValue(mockRepos);
    (useBookMarks as any).mockReturnValue({
      addBookMark: mockAddBookMark,
      isBookmarked: mockIsBookmarked,
    });
    
    mockIsBookmarked.mockImplementation((id: number) => id === 2);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  
  it('should fetch repositories when modal is opened', async () => {
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    expect(getUserRepos).toHaveBeenCalledWith('testuser', 1);
    
    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Showing 2 repositories')).toBeInTheDocument();
    });
  });
  
  it('should display repository information correctly', async () => {
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
      expect(screen.getByText('Test description 1')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      
      expect(screen.getByText('test-repo-2')).toBeInTheDocument();
      expect(screen.getByText('Test description 2')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
  
  it('should handle empty repository list', async () => {
    (getUserRepos as any).mockResolvedValue([]);
    
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('No repositories found')).toBeInTheDocument();
    });
  });
  
  it('should display error message when API fails', async () => {
    (getUserRepos as any).mockRejectedValue(new Error('API Error'));
    
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load repositories. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('should mark repositories as bookmarked correctly', async () => {
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      const bookmarkButtons = screen.getAllByText('Bookmark');
      expect(bookmarkButtons.length).toBe(1);
      const bookmarkedButtons = screen.getAllByText('Bookmarked');
      expect(bookmarkedButtons.length).toBe(1);
    });
  });
  
  it('should call addBookMark when bookmarking a repository', async () => {
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      const bookmarkButton = screen.getAllByText('Bookmark')[0];
      fireEvent.click(bookmarkButton);
    });
    
    expect(mockAddBookMark).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      name: 'test-repo-1',
    }));
  });
  
  it('should close modal when calling onClose', async () => {
    const { rerender } = render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    expect(screen.getByText("testuser's Repositories")).toBeInTheDocument();
    rerender(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={false} 
        onClose={mockOnClose} 
      />
    );
    expect(getUserRepos).toHaveBeenCalledTimes(1);
  });


  it('should render repository without description correctly', async () => {
    const reposWithoutDesc = [
      {
        ...mockRepos[0],
        description: null
      }
    ];
    
    (getUserRepos as any).mockResolvedValue(reposWithoutDesc);
    
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('No description provided')).toBeInTheDocument();
    });
  });

  it('should render repository without language correctly', async () => {
    const reposWithoutLang = [
      {
        ...mockRepos[0],
        language: null
      }
    ];
    
    (getUserRepos as any).mockResolvedValue(reposWithoutLang);
    
    render(
      <UserRepositoriesModal 
        username="testuser" 
        isOpen={true} 
        onClose={mockOnClose} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    });
  });
});