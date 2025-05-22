import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BookMarkProvider, useBookMarks } from './BookMarkProvider';
import { useAuth } from './AuthProvider';
import type { GitRepo } from '@/types';
import '@testing-library/jest-dom';

vi.mock('./AuthProvider', () => ({
  useAuth: vi.fn(),
}));

const mockUser = { name: 'testuser', email: 'test@email.com' };
const baseRepo: GitRepo = {
  id: 1,
  name: 'repo1',
  full_name: 'testuser/repo1',
  description: 'desc',
  html_url: 'https://github.com/testuser/repo1',
  owner: { login: 'testuser', avatar_url: '', html_url: '' },
  stargazers_count: 5,
  forks_count: 2,
  language: 'TypeScript',
  updated_at: '',
};

function renderWithProvider(children: React.ReactNode) {
  return render(<BookMarkProvider>{children}</BookMarkProvider>);
}

describe('<BookMarkProvider />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  it('provides default context values', () => {
    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('bm-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('bm-list')).toHaveTextContent('[]');
  });

  it('addBookMark adds a bookmark', async () => {
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('add-btn').click();
    await waitFor(() => {
      expect(screen.getByTestId('bm-list')).not.toHaveTextContent('[]');
      expect(screen.getByTestId('bm-list')).toHaveTextContent('repo1');
    });
    expect(localStorage.getItem('userBookMarks')).toContain('repo1');
  });

  it('removeBookMark removes a bookmark', async () => {
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('add-btn').click();
    await waitFor(() => expect(screen.getByTestId('bm-list')).toHaveTextContent('repo1'));
    await screen.getByTestId('remove-btn').click();
    await waitFor(() => expect(screen.getByTestId('bm-list')).not.toHaveTextContent('repo1'));
  });

  it('addMultipleBookMarks adds multiple bookmarks', async () => {
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('add-multi-btn').click();
    await waitFor(() => {
      expect(screen.getByTestId('bm-list')).toHaveTextContent('repo1');
      expect(screen.getByTestId('bm-list')).toHaveTextContent('repo2');
    });
  });

  it('isBookmarked returns correct value', async () => {
    renderWithProvider(<TestComponent />);
    await screen.getByTestId('add-btn').click();
    await waitFor(() => expect(screen.getByTestId('bm-is-bookmarked')).toHaveTextContent('true'));
    await screen.getByTestId('remove-btn').click();
    await waitFor(() => expect(screen.getByTestId('bm-is-bookmarked')).toHaveTextContent('false'));
  });
});

function TestComponent() {
  const { bookMarks, isLoading, addBookMark, removeBookMark, addMultipleBookMarks, isBookmarked } = useBookMarks();
  return (
    <div>
      <div data-testid="bm-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="bm-list">{JSON.stringify(bookMarks)}</div>
      <div data-testid="bm-is-bookmarked">{isBookmarked(1) ? 'true' : 'false'}</div>
      <button data-testid="add-btn" onClick={() => addBookMark(baseRepo)}>Add</button>
      <button data-testid="remove-btn" onClick={() => removeBookMark(1)}>Remove</button>
      <button data-testid="add-multi-btn" onClick={() => addMultipleBookMarks([
        { ...baseRepo, id: 1, name: 'repo1', bookmarked_at: new Date().toISOString() },
        { ...baseRepo, id: 2, name: 'repo2', bookmarked_at: new Date().toISOString() },
      ])}>AddMulti</button>
    </div>
  );
}
